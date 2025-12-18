"""
Vision Language Model Service for Street Lifting Video Analysis

This module provides integration with various VLM backends:
1. vLLM with LLaVA or Qwen-VL models (self-hosted)
2. OpenAI GPT-4V/GPT-4o (cloud API)
3. Google Gemini Pro Vision (cloud API)

The service extracts frames from videos and sends them to the VLM
for analysis based on street lifting regulations.
"""

import os
import base64
import json
import asyncio
import tempfile
from pathlib import Path
from typing import List, Optional, Tuple, Dict, Any
from dataclasses import dataclass
from enum import Enum
from abc import ABC, abstractmethod

import httpx


class VLMBackend(str, Enum):
    VLLM_LLAVA = "vllm_llava"
    VLLM_QWEN = "vllm_qwen"
    OPENAI_GPT4V = "openai_gpt4v"
    OPENAI_GPT4O = "openai_gpt4o"
    GEMINI_PRO = "gemini_pro"


@dataclass
class FrameData:
    """Represents an extracted video frame."""
    frame_number: int
    timestamp_ms: float
    image_base64: str
    width: int
    height: int


@dataclass
class VideoAnalysisRequest:
    """Request structure for video analysis."""
    discipline: str  # "pull_up", "dip", "squat"
    video_path: Optional[str] = None
    video_bytes: Optional[bytes] = None
    frames: Optional[List[FrameData]] = None
    additional_context: Optional[str] = None
    camera_angle: str = "front"  # "front", "side", "parallel"


@dataclass 
class JudgmentDetail:
    """Detailed judgment for a specific criteria."""
    criteria: str
    passed: bool
    confidence: float
    explanation: str


@dataclass
class VideoJudgmentResult:
    """Complete judgment result for a video."""
    is_valid: bool
    confidence: float
    discipline: str
    rep_count: int
    details: List[JudgmentDetail]
    invalid_reasons: List[str]
    frame_analysis: Dict[str, Any]
    raw_response: str
    model_used: str


class VideoFrameExtractor:
    """
    Extracts frames from video files for VLM analysis.
    Uses ffmpeg or opencv for frame extraction.
    """
    
    def __init__(self, use_opencv: bool = True):
        self.use_opencv = use_opencv
        self._cv2 = None
        
    def _get_cv2(self):
        """Lazy load opencv."""
        if self._cv2 is None:
            try:
                import cv2
                self._cv2 = cv2
            except ImportError:
                raise ImportError(
                    "OpenCV is required for video processing. "
                    "Install with: pip install opencv-python"
                )
        return self._cv2
    
    def extract_frames(
        self,
        video_path: str,
        num_frames: int = 16,
        uniform: bool = True
    ) -> List[FrameData]:
        """
        Extract frames from a video file.
        
        Args:
            video_path: Path to the video file
            num_frames: Number of frames to extract
            uniform: If True, extract uniformly spaced frames
            
        Returns:
            List of FrameData objects
        """
        cv2 = self._get_cv2()
        
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Cannot open video file: {video_path}")
        
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        if uniform:
            frame_indices = [
                int(i * total_frames / num_frames) 
                for i in range(num_frames)
            ]
        else:
            # Extract at key moments (start, quarter, half, three-quarter, end)
            frame_indices = [
                0,
                total_frames // 4,
                total_frames // 2,
                3 * total_frames // 4,
                total_frames - 1
            ]
            # Add more frames if needed
            while len(frame_indices) < num_frames:
                new_indices = []
                for i in range(len(frame_indices) - 1):
                    mid = (frame_indices[i] + frame_indices[i + 1]) // 2
                    new_indices.append(mid)
                frame_indices = sorted(set(frame_indices + new_indices))
                frame_indices = frame_indices[:num_frames]
        
        frames = []
        for idx in frame_indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ret, frame = cap.read()
            if ret:
                # Resize if frame is too large (max 1024px on longest side)
                max_dim = max(width, height)
                if max_dim > 1024:
                    scale = 1024 / max_dim
                    new_width = int(width * scale)
                    new_height = int(height * scale)
                    frame = cv2.resize(frame, (new_width, new_height))
                
                # Encode to base64
                _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
                img_base64 = base64.b64encode(buffer).decode('utf-8')
                
                timestamp_ms = (idx / fps) * 1000 if fps > 0 else 0
                
                frames.append(FrameData(
                    frame_number=idx,
                    timestamp_ms=timestamp_ms,
                    image_base64=img_base64,
                    width=frame.shape[1],
                    height=frame.shape[0]
                ))
        
        cap.release()
        return frames
    
    def extract_frames_from_bytes(
        self,
        video_bytes: bytes,
        num_frames: int = 16
    ) -> List[FrameData]:
        """Extract frames from video bytes."""
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as f:
            f.write(video_bytes)
            temp_path = f.name
        
        try:
            return self.extract_frames(temp_path, num_frames)
        finally:
            os.unlink(temp_path)


class VLMClient(ABC):
    """Abstract base class for VLM clients."""
    
    @abstractmethod
    async def analyze_frames(
        self,
        frames: List[FrameData],
        prompt: str,
        system_prompt: Optional[str] = None
    ) -> str:
        """Analyze video frames and return the model's response."""
        pass
    
    @property
    @abstractmethod
    def model_name(self) -> str:
        """Return the model name/identifier."""
        pass


class VLLMClient(VLMClient):
    """
    Client for vLLM-served vision language models.
    Supports LLaVA, Qwen-VL, and other vision models served via vLLM.
    """
    
    def __init__(
        self,
        base_url: str = "http://localhost:8000",
        model: str = "llava-hf/llava-1.5-7b-hf",
        api_key: Optional[str] = None
    ):
        self.base_url = base_url.rstrip('/')
        self.model = model
        self.api_key = api_key
        self._client = None
    
    @property
    def model_name(self) -> str:
        return f"vLLM:{self.model}"
    
    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None:
            headers = {}
            if self.api_key:
                headers["Authorization"] = f"Bearer {self.api_key}"
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                headers=headers,
                timeout=120.0
            )
        return self._client
    
    async def analyze_frames(
        self,
        frames: List[FrameData],
        prompt: str,
        system_prompt: Optional[str] = None
    ) -> str:
        """
        Analyze frames using vLLM's OpenAI-compatible API.
        """
        client = await self._get_client()
        
        # Build message content with images
        content = []
        
        # Add frames as images
        for i, frame in enumerate(frames):
            content.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{frame.image_base64}"
                }
            })
        
        # Add the text prompt
        content.append({
            "type": "text",
            "text": prompt
        })
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": content})
        
        # Call vLLM's OpenAI-compatible endpoint
        response = await client.post(
            "/v1/chat/completions",
            json={
                "model": self.model,
                "messages": messages,
                "max_tokens": 2048,
                "temperature": 0.1,  # Low temperature for consistent judgments
            }
        )
        response.raise_for_status()
        
        result = response.json()
        return result["choices"][0]["message"]["content"]
    
    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None


class OpenAIClient(VLMClient):
    """Client for OpenAI GPT-4V/GPT-4o models."""
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = "gpt-4o"
    ):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.model = model
        self._client = None
    
    @property
    def model_name(self) -> str:
        return f"OpenAI:{self.model}"
    
    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(
                base_url="https://api.openai.com",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                timeout=120.0
            )
        return self._client
    
    async def analyze_frames(
        self,
        frames: List[FrameData],
        prompt: str,
        system_prompt: Optional[str] = None
    ) -> str:
        client = await self._get_client()
        
        content = []
        for frame in frames:
            content.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{frame.image_base64}",
                    "detail": "high"
                }
            })
        content.append({"type": "text", "text": prompt})
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": content})
        
        response = await client.post(
            "/v1/chat/completions",
            json={
                "model": self.model,
                "messages": messages,
                "max_tokens": 2048,
                "temperature": 0.1,
            }
        )
        response.raise_for_status()
        
        result = response.json()
        return result["choices"][0]["message"]["content"]
    
    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None


class GeminiClient(VLMClient):
    """Client for Google Gemini Pro Vision."""
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = "gemini-1.5-pro"
    ):
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY")
        self.model = model
        self._client = None
    
    @property
    def model_name(self) -> str:
        return f"Gemini:{self.model}"
    
    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(timeout=120.0)
        return self._client
    
    async def analyze_frames(
        self,
        frames: List[FrameData],
        prompt: str,
        system_prompt: Optional[str] = None
    ) -> str:
        client = await self._get_client()
        
        # Build parts for Gemini
        parts = []
        
        # Add system prompt as text if provided
        if system_prompt:
            parts.append({"text": system_prompt + "\n\n"})
        
        # Add images
        for frame in frames:
            parts.append({
                "inline_data": {
                    "mime_type": "image/jpeg",
                    "data": frame.image_base64
                }
            })
        
        # Add the prompt
        parts.append({"text": prompt})
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"
        
        response = await client.post(
            url,
            params={"key": self.api_key},
            json={
                "contents": [{"parts": parts}],
                "generationConfig": {
                    "temperature": 0.1,
                    "maxOutputTokens": 2048,
                }
            }
        )
        response.raise_for_status()
        
        result = response.json()
        return result["candidates"][0]["content"]["parts"][0]["text"]
    
    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None


def create_vlm_client(
    backend: VLMBackend,
    **kwargs
) -> VLMClient:
    """Factory function to create the appropriate VLM client."""
    
    if backend == VLMBackend.VLLM_LLAVA:
        return VLLMClient(
            model=kwargs.get("model", "llava-hf/llava-1.5-7b-hf"),
            base_url=kwargs.get("base_url", "http://localhost:8000"),
            api_key=kwargs.get("api_key")
        )
    
    elif backend == VLMBackend.VLLM_QWEN:
        return VLLMClient(
            model=kwargs.get("model", "Qwen/Qwen2-VL-7B-Instruct"),
            base_url=kwargs.get("base_url", "http://localhost:8000"),
            api_key=kwargs.get("api_key")
        )
    
    elif backend == VLMBackend.OPENAI_GPT4V:
        return OpenAIClient(
            model="gpt-4-vision-preview",
            api_key=kwargs.get("api_key")
        )
    
    elif backend == VLMBackend.OPENAI_GPT4O:
        return OpenAIClient(
            model="gpt-4o",
            api_key=kwargs.get("api_key")
        )
    
    elif backend == VLMBackend.GEMINI_PRO:
        return GeminiClient(
            model=kwargs.get("model", "gemini-1.5-pro"),
            api_key=kwargs.get("api_key")
        )
    
    else:
        raise ValueError(f"Unknown backend: {backend}")

