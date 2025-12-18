"""
Main Street Lifting Video Judge Service

This service coordinates:
1. Video frame extraction
2. VLM-based analysis
3. Result parsing and formatting
"""

import json
import re
import logging
from typing import Optional, List, Dict, Any, Tuple
from dataclasses import dataclass, asdict

from .regulations import Discipline, JudgmentResult, get_invalid_reasons
from .vlm_service import (
    VLMClient,
    VLMBackend,
    VideoFrameExtractor,
    FrameData,
    VideoJudgmentResult,
    JudgmentDetail,
    create_vlm_client,
)
from .prompts import get_prompt_for_discipline, SYSTEM_PROMPT, get_multi_angle_prompt


logger = logging.getLogger(__name__)


@dataclass
class JudgeConfig:
    """Configuration for the video judge service."""
    vlm_backend: VLMBackend = VLMBackend.OPENAI_GPT4O
    vlm_base_url: str = "http://localhost:8000"
    vlm_api_key: Optional[str] = None
    vlm_model: Optional[str] = None
    num_frames: int = 16
    confidence_threshold: float = 0.7
    strict_mode: bool = True  # If True, "uncertain" criteria count as failed


class StreetLiftingJudge:
    """
    Main service for judging street lifting video attempts.
    
    Usage:
        judge = StreetLiftingJudge(config)
        result = await judge.analyze_video(
            discipline=Discipline.PULL_UP,
            video_path="/path/to/video.mp4",
            camera_angle="front"
        )
    """
    
    def __init__(self, config: Optional[JudgeConfig] = None):
        self.config = config or JudgeConfig()
        self.frame_extractor = VideoFrameExtractor()
        self._vlm_client: Optional[VLMClient] = None
    
    async def _get_vlm_client(self) -> VLMClient:
        """Get or create the VLM client."""
        if self._vlm_client is None:
            kwargs = {}
            if self.config.vlm_base_url:
                kwargs["base_url"] = self.config.vlm_base_url
            if self.config.vlm_api_key:
                kwargs["api_key"] = self.config.vlm_api_key
            if self.config.vlm_model:
                kwargs["model"] = self.config.vlm_model
            
            self._vlm_client = create_vlm_client(
                self.config.vlm_backend,
                **kwargs
            )
        return self._vlm_client
    
    async def analyze_video(
        self,
        discipline: Discipline,
        video_path: Optional[str] = None,
        video_bytes: Optional[bytes] = None,
        camera_angle: str = "front",
        secondary_video_path: Optional[str] = None,
        additional_context: Optional[str] = None
    ) -> VideoJudgmentResult:
        """
        Analyze a street lifting video and return judgment.
        
        Args:
            discipline: The discipline being judged (pull_up, dip, squat)
            video_path: Path to the video file
            video_bytes: Video content as bytes (alternative to path)
            camera_angle: Camera angle ("front", "side", "parallel")
            secondary_video_path: Optional secondary angle video (for pull-ups)
            additional_context: Any additional context for the judge
            
        Returns:
            VideoJudgmentResult with detailed analysis
        """
        # Extract frames from primary video
        if video_path:
            frames = self.frame_extractor.extract_frames(
                video_path, 
                num_frames=self.config.num_frames
            )
        elif video_bytes:
            frames = self.frame_extractor.extract_frames_from_bytes(
                video_bytes,
                num_frames=self.config.num_frames
            )
        else:
            raise ValueError("Either video_path or video_bytes must be provided")
        
        # If secondary video provided, extract and combine frames
        has_secondary = False
        if secondary_video_path:
            secondary_frames = self.frame_extractor.extract_frames(
                secondary_video_path,
                num_frames=self.config.num_frames // 2
            )
            # Reduce primary frames and interleave with secondary
            primary_subset = frames[:self.config.num_frames // 2]
            frames = self._interleave_frames(primary_subset, secondary_frames)
            has_secondary = True
        
        # Get the appropriate prompt
        if has_secondary:
            prompt = get_multi_angle_prompt(discipline, [camera_angle, "parallel"])
        else:
            prompt = get_prompt_for_discipline(
                discipline,
                camera_angle,
                has_secondary
            )
        
        if additional_context:
            prompt += f"\n\nADDITIONAL CONTEXT: {additional_context}"
        
        # Get VLM analysis
        vlm_client = await self._get_vlm_client()
        raw_response = await vlm_client.analyze_frames(
            frames,
            prompt,
            SYSTEM_PROMPT
        )
        
        # Parse the response
        result = self._parse_vlm_response(raw_response, discipline, vlm_client.model_name)
        
        return result
    
    def _interleave_frames(
        self,
        primary: List[FrameData],
        secondary: List[FrameData]
    ) -> List[FrameData]:
        """Interleave frames from two video sources."""
        result = []
        max_len = max(len(primary), len(secondary))
        for i in range(max_len):
            if i < len(primary):
                result.append(primary[i])
            if i < len(secondary):
                result.append(secondary[i])
        return result
    
    def _parse_vlm_response(
        self,
        raw_response: str,
        discipline: Discipline,
        model_name: str
    ) -> VideoJudgmentResult:
        """Parse the VLM response into a structured result."""
        
        # Try to extract JSON from the response
        json_match = re.search(r'```json\s*(.*?)\s*```', raw_response, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        else:
            # Try to find raw JSON
            json_match = re.search(r'\{.*\}', raw_response, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
            else:
                # Couldn't parse, return a needs_review result
                return VideoJudgmentResult(
                    is_valid=False,
                    confidence=0.0,
                    discipline=discipline.value,
                    rep_count=0,
                    details=[],
                    invalid_reasons=["Could not parse VLM response"],
                    frame_analysis={"error": "Parse failed"},
                    raw_response=raw_response,
                    model_used=model_name
                )
        
        try:
            parsed = json.loads(json_str)
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error: {e}")
            return VideoJudgmentResult(
                is_valid=False,
                confidence=0.0,
                discipline=discipline.value,
                rep_count=0,
                details=[],
                invalid_reasons=[f"JSON parse error: {str(e)}"],
                frame_analysis={"error": "JSON parse failed"},
                raw_response=raw_response,
                model_used=model_name
            )
        
        # Extract structured information
        overall_judgment = parsed.get("overall_judgment", "NEEDS_REVIEW")
        is_valid = overall_judgment == "VALID"
        confidence = float(parsed.get("confidence", 0.5))
        
        valid_reps = parsed.get("valid_reps", 0)
        invalid_reps = parsed.get("invalid_reps", 0)
        total_reps = parsed.get("total_reps_attempted", valid_reps + invalid_reps)
        
        # Build detailed judgments
        details = []
        invalid_reasons = []
        
        rep_analysis = parsed.get("rep_analysis", [])
        for rep in rep_analysis:
            rep_num = rep.get("rep_number", 0)
            criteria_met = rep.get("criteria_met", {})
            
            for criteria_name, status in criteria_met.items():
                passed = status is True
                if self.config.strict_mode and status == "uncertain":
                    passed = False
                
                details.append(JudgmentDetail(
                    criteria=f"Rep {rep_num}: {criteria_name}",
                    passed=passed,
                    confidence=float(rep.get("confidence", 0.5)),
                    explanation=f"Status: {status}"
                ))
            
            # Collect invalid reasons
            rep_invalid_reasons = rep.get("invalid_reasons", [])
            for reason in rep_invalid_reasons:
                invalid_reasons.append(f"Rep {rep_num}: {reason}")
        
        # Frame analysis
        frame_analysis = parsed.get("frame_observations", {})
        frame_analysis["recommendations"] = parsed.get("recommendations", "")
        
        return VideoJudgmentResult(
            is_valid=is_valid,
            confidence=confidence,
            discipline=discipline.value,
            rep_count=total_reps,
            details=details,
            invalid_reasons=invalid_reasons,
            frame_analysis=frame_analysis,
            raw_response=raw_response,
            model_used=model_name
        )
    
    async def analyze_with_retry(
        self,
        discipline: Discipline,
        video_path: str,
        camera_angle: str = "front",
        max_retries: int = 2
    ) -> VideoJudgmentResult:
        """Analyze with retry logic for robustness."""
        
        last_error = None
        for attempt in range(max_retries + 1):
            try:
                return await self.analyze_video(
                    discipline=discipline,
                    video_path=video_path,
                    camera_angle=camera_angle
                )
            except Exception as e:
                last_error = e
                logger.warning(f"Attempt {attempt + 1} failed: {e}")
                if attempt < max_retries:
                    continue
        
        # All retries failed
        return VideoJudgmentResult(
            is_valid=False,
            confidence=0.0,
            discipline=discipline.value,
            rep_count=0,
            details=[],
            invalid_reasons=[f"Analysis failed after {max_retries + 1} attempts: {str(last_error)}"],
            frame_analysis={"error": str(last_error)},
            raw_response="",
            model_used="N/A"
        )
    
    async def close(self):
        """Clean up resources."""
        if self._vlm_client:
            await self._vlm_client.close()
            self._vlm_client = None


# Convenience function for quick analysis
async def judge_attempt(
    discipline: str,
    video_path: str,
    camera_angle: str = "auto",
    backend: str = "openai_gpt4o",
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Quick function to judge a street lifting attempt.
    
    Args:
        discipline: "pull_up", "dip", or "squat"
        video_path: Path to video file
        camera_angle: "front", "side", "parallel", or "auto"
        backend: VLM backend to use
        api_key: API key for the backend
        
    Returns:
        Dictionary with judgment results
    """
    # Auto-select camera angle based on discipline
    if camera_angle == "auto":
        if discipline == "pull_up":
            camera_angle = "front"
        else:
            camera_angle = "side"
    
    # Create config
    config = JudgeConfig(
        vlm_backend=VLMBackend(backend),
        vlm_api_key=api_key
    )
    
    # Create judge and analyze
    judge = StreetLiftingJudge(config)
    try:
        result = await judge.analyze_video(
            discipline=Discipline(discipline),
            video_path=video_path,
            camera_angle=camera_angle
        )
        return asdict(result)
    finally:
        await judge.close()

