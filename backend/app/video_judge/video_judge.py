"""
FastAPI Router for Street Lifting Video Judge

Provides REST API endpoints for:
1. Submitting videos for judgment
2. Checking judgment status
3. Retrieving judgment results
"""

import os
import uuid
import asyncio
import tempfile
from datetime import datetime
from typing import Optional, Dict, Any, List
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field

from .regulations import Discipline, JudgmentResult
from .vlm_service import VLMBackend
from .judge_service import StreetLiftingJudge, JudgeConfig


router = APIRouter(prefix="/video-judge", tags=["Video Judge"])


# ============================================================================
# Request/Response Models
# ============================================================================

class JudgmentRequest(BaseModel):
    """Request model for video judgment."""
    discipline: str = Field(..., description="Discipline: pull_up, dip, or squat")
    camera_angle: str = Field(default="auto", description="Camera angle: front, side, parallel, or auto")
    additional_context: Optional[str] = Field(default=None, description="Additional context for the judge")


class JudgmentResponse(BaseModel):
    """Response model for video judgment."""
    judgment_id: str
    discipline: str
    is_valid: bool
    confidence: float
    rep_count: int
    overall_judgment: str
    invalid_reasons: List[str]
    details: List[Dict[str, Any]]
    frame_analysis: Dict[str, Any]
    model_used: str
    processed_at: str


class JudgmentStatusResponse(BaseModel):
    """Response model for judgment status check."""
    judgment_id: str
    status: str  # "pending", "processing", "completed", "failed"
    result: Optional[JudgmentResponse] = None
    error: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    vlm_backend: str
    available_disciplines: List[str]


# ============================================================================
# In-memory storage for async processing
# (In production, use Redis or a database)
# ============================================================================

judgment_store: Dict[str, Dict[str, Any]] = {}


# ============================================================================
# Configuration
# ============================================================================

def get_judge_config() -> JudgeConfig:
    """Get judge configuration from environment variables."""
    backend_str = os.getenv("VLM_BACKEND", "openai_gpt4o")
    
    return JudgeConfig(
        vlm_backend=VLMBackend(backend_str),
        vlm_base_url=os.getenv("VLLM_BASE_URL", "http://localhost:8000"),
        vlm_api_key=os.getenv("VLM_API_KEY") or os.getenv("OPENAI_API_KEY"),
        vlm_model=os.getenv("VLM_MODEL"),
        num_frames=int(os.getenv("VLM_NUM_FRAMES", "16")),
        confidence_threshold=float(os.getenv("VLM_CONFIDENCE_THRESHOLD", "0.7")),
        strict_mode=os.getenv("VLM_STRICT_MODE", "true").lower() == "true"
    )


# ============================================================================
# Endpoints
# ============================================================================

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Check the health of the video judge service."""
    config = get_judge_config()
    
    return HealthResponse(
        status="healthy",
        vlm_backend=config.vlm_backend.value,
        available_disciplines=["pull_up", "dip", "squat"]
    )


@router.post("/analyze", response_model=JudgmentResponse)
async def analyze_video(
    video: UploadFile = File(..., description="Video file to analyze"),
    discipline: str = Form(..., description="Discipline: pull_up, dip, or squat"),
    camera_angle: str = Form(default="auto", description="Camera angle: front, side, parallel, or auto"),
    additional_context: Optional[str] = Form(default=None, description="Additional context"),
    secondary_video: Optional[UploadFile] = File(default=None, description="Secondary angle video (optional)")
):
    """
    Analyze a street lifting video and return judgment.
    
    This endpoint processes the video synchronously and returns the result.
    For longer videos, consider using the async endpoint.
    
    - **video**: The main video file (MP4, MOV, AVI, etc.)
    - **discipline**: The discipline being judged (pull_up, dip, squat)
    - **camera_angle**: Camera angle (front, side, parallel, auto)
    - **secondary_video**: Optional secondary angle for pull-ups
    """
    # Validate discipline
    try:
        disc = Discipline(discipline)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid discipline: {discipline}. Must be one of: pull_up, dip, squat"
        )
    
    # Auto-select camera angle
    if camera_angle == "auto":
        if discipline == "pull_up":
            camera_angle = "front"
        else:
            camera_angle = "side"
    
    # Save uploaded video to temp file
    try:
        video_bytes = await video.read()
        
        secondary_path = None
        if secondary_video:
            secondary_bytes = await secondary_video.read()
            secondary_temp = tempfile.NamedTemporaryFile(
                suffix=Path(secondary_video.filename or "video.mp4").suffix,
                delete=False
            )
            secondary_temp.write(secondary_bytes)
            secondary_temp.close()
            secondary_path = secondary_temp.name
        
        # Create judge and analyze
        config = get_judge_config()
        judge = StreetLiftingJudge(config)
        
        try:
            result = await judge.analyze_video(
                discipline=disc,
                video_bytes=video_bytes,
                camera_angle=camera_angle,
                secondary_video_path=secondary_path,
                additional_context=additional_context
            )
        finally:
            await judge.close()
            
            # Clean up secondary video temp file
            if secondary_path and os.path.exists(secondary_path):
                os.unlink(secondary_path)
        
        # Build response
        judgment_id = str(uuid.uuid4())
        
        return JudgmentResponse(
            judgment_id=judgment_id,
            discipline=result.discipline,
            is_valid=result.is_valid,
            confidence=result.confidence,
            rep_count=result.rep_count,
            overall_judgment="VALID" if result.is_valid else "INVALID",
            invalid_reasons=result.invalid_reasons,
            details=[{
                "criteria": d.criteria,
                "passed": d.passed,
                "confidence": d.confidence,
                "explanation": d.explanation
            } for d in result.details],
            frame_analysis=result.frame_analysis,
            model_used=result.model_used,
            processed_at=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing video: {str(e)}"
        )


@router.post("/analyze-async")
async def analyze_video_async(
    background_tasks: BackgroundTasks,
    video: UploadFile = File(...),
    discipline: str = Form(...),
    camera_angle: str = Form(default="auto"),
    additional_context: Optional[str] = Form(default=None)
):
    """
    Submit a video for asynchronous analysis.
    
    Returns a judgment_id that can be used to check the status
    and retrieve results using the /status/{judgment_id} endpoint.
    """
    # Validate discipline
    try:
        disc = Discipline(discipline)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid discipline: {discipline}"
        )
    
    # Generate judgment ID
    judgment_id = str(uuid.uuid4())
    
    # Save video to temp file
    video_bytes = await video.read()
    temp_file = tempfile.NamedTemporaryFile(
        suffix=Path(video.filename or "video.mp4").suffix,
        delete=False
    )
    temp_file.write(video_bytes)
    temp_file.close()
    
    # Initialize status
    judgment_store[judgment_id] = {
        "status": "pending",
        "discipline": discipline,
        "submitted_at": datetime.utcnow().isoformat(),
        "video_path": temp_file.name
    }
    
    # Schedule background task
    background_tasks.add_task(
        process_video_background,
        judgment_id=judgment_id,
        video_path=temp_file.name,
        discipline=disc,
        camera_angle=camera_angle,
        additional_context=additional_context
    )
    
    return {
        "judgment_id": judgment_id,
        "status": "pending",
        "message": "Video submitted for analysis. Use /status/{judgment_id} to check progress."
    }


async def process_video_background(
    judgment_id: str,
    video_path: str,
    discipline: Discipline,
    camera_angle: str,
    additional_context: Optional[str]
):
    """Background task to process video."""
    try:
        judgment_store[judgment_id]["status"] = "processing"
        
        # Auto-select camera angle
        if camera_angle == "auto":
            if discipline == Discipline.PULL_UP:
                camera_angle = "front"
            else:
                camera_angle = "side"
        
        config = get_judge_config()
        judge = StreetLiftingJudge(config)
        
        try:
            result = await judge.analyze_video(
                discipline=discipline,
                video_path=video_path,
                camera_angle=camera_angle,
                additional_context=additional_context
            )
        finally:
            await judge.close()
        
        # Store result
        judgment_store[judgment_id] = {
            "status": "completed",
            "result": {
                "judgment_id": judgment_id,
                "discipline": result.discipline,
                "is_valid": result.is_valid,
                "confidence": result.confidence,
                "rep_count": result.rep_count,
                "overall_judgment": "VALID" if result.is_valid else "INVALID",
                "invalid_reasons": result.invalid_reasons,
                "details": [{
                    "criteria": d.criteria,
                    "passed": d.passed,
                    "confidence": d.confidence,
                    "explanation": d.explanation
                } for d in result.details],
                "frame_analysis": result.frame_analysis,
                "model_used": result.model_used,
                "processed_at": datetime.utcnow().isoformat()
            }
        }
        
    except Exception as e:
        judgment_store[judgment_id] = {
            "status": "failed",
            "error": str(e)
        }
    
    finally:
        # Clean up temp file
        if os.path.exists(video_path):
            os.unlink(video_path)


@router.get("/status/{judgment_id}", response_model=JudgmentStatusResponse)
async def get_judgment_status(judgment_id: str):
    """
    Check the status of an async judgment request.
    
    Returns the current status and result if completed.
    """
    if judgment_id not in judgment_store:
        raise HTTPException(
            status_code=404,
            detail=f"Judgment ID not found: {judgment_id}"
        )
    
    data = judgment_store[judgment_id]
    
    response = JudgmentStatusResponse(
        judgment_id=judgment_id,
        status=data["status"]
    )
    
    if data["status"] == "completed":
        response.result = JudgmentResponse(**data["result"])
    elif data["status"] == "failed":
        response.error = data.get("error", "Unknown error")
    
    return response


@router.get("/regulations/{discipline}")
async def get_regulations(discipline: str):
    """
    Get the official regulations for a discipline.
    
    Returns the full regulation text and visual criteria checklist.
    """
    try:
        disc = Discipline(discipline)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid discipline: {discipline}"
        )
    
    from .regulations import get_regulation_text, get_visual_criteria, get_invalid_reasons
    
    return {
        "discipline": discipline,
        "regulations": get_regulation_text(disc),
        "visual_criteria": get_visual_criteria(disc),
        "common_invalid_reasons": [
            {"code": r.code, "description": r.description, "severity": r.severity}
            for r in get_invalid_reasons(disc)
        ]
    }


@router.get("/disciplines")
async def list_disciplines():
    """List all available disciplines and their requirements."""
    return {
        "disciplines": [
            {
                "id": "pull_up",
                "name": "Pull-Up",
                "required_camera_angles": ["front"],
                "optional_camera_angles": ["parallel"],
                "description": "Athlete pulls body up on a bar until chin clears the bar"
            },
            {
                "id": "dip",
                "name": "Dip",
                "required_camera_angles": ["side"],
                "optional_camera_angles": [],
                "description": "Athlete lowers body on parallel bars until upper arms are parallel"
            },
            {
                "id": "squat",
                "name": "Squat",
                "required_camera_angles": ["side"],
                "optional_camera_angles": [],
                "description": "Athlete squats with barbell until hip crease is below knee"
            }
        ]
    }

