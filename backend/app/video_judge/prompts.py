"""
Prompt templates for street lifting video analysis.

These prompts are carefully crafted to guide the VLM in analyzing
video frames according to international street lifting regulations.
"""

from .regulations import (
    Discipline,
    PULL_UP_REGULATIONS,
    DIP_REGULATIONS,
    SQUAT_REGULATIONS,
    PULL_UP_VISUAL_CRITERIA,
    DIP_VISUAL_CRITERIA,
    SQUAT_VISUAL_CRITERIA,
)


SYSTEM_PROMPT = """You are an expert street lifting competition judge with extensive experience 
in evaluating athletic performance according to international street lifting regulations.

Your role is to analyze video frames of street lifting attempts and determine whether 
each repetition meets the official standards. You must be:

1. PRECISE: Apply the exact criteria from the regulations
2. OBJECTIVE: Base judgments solely on visible evidence in the frames
3. CONSISTENT: Apply the same standards to all athletes
4. THOROUGH: Check all required criteria for each repetition

When analyzing videos:
- Examine each frame carefully for body position and form
- Track the athlete's movement through the repetition
- Identify the start position, bottom/top position, and completion
- Note any technical violations

Your judgment must be fair but strict - if you cannot clearly confirm a criterion 
is met from the available frames, note it as uncertain.

Always respond in the specified JSON format."""


def get_pull_up_prompt(camera_angle: str = "front", has_secondary_view: bool = False) -> str:
    """Generate the analysis prompt for pull-up attempts."""
    
    secondary_view_note = ""
    if has_secondary_view:
        secondary_view_note = """
NOTE: You have been provided with TWO camera angles:
- FRONT VIEW: Primary view facing the athlete
- SIDE VIEW (parallel to bar): Secondary view to confirm bar clearance

Use the side view to definitively determine if the chin clears the bar when 
the front view is ambiguous.
"""
    
    return f"""STREET LIFTING PULL-UP ANALYSIS

{PULL_UP_REGULATIONS}

{secondary_view_note}

CAMERA ANGLE: {camera_angle.upper()} VIEW

Analyze the provided video frames and evaluate the pull-up attempt(s).

For EACH repetition visible in the frames, evaluate:

1. STARTING/BOTTOM POSITION:
   - Are the arms fully extended (dead hang)?
   - Is the body stable (minimal swing)?
   - Are feet off the ground?

2. TOP POSITION:
   - Does the chin CLEARLY pass above the bar?
   - Can you see daylight between the chin and bar level?
   
3. MOVEMENT QUALITY:
   - Is the movement controlled (no excessive kipping)?
   - Is the descent controlled?
   - Does the athlete return to full arm extension?

Respond with the following JSON structure:
```json
{{
    "discipline": "pull_up",
    "total_reps_attempted": <number>,
    "valid_reps": <number>,
    "invalid_reps": <number>,
    "overall_judgment": "VALID" | "INVALID" | "NEEDS_REVIEW",
    "confidence": <0.0-1.0>,
    "rep_analysis": [
        {{
            "rep_number": 1,
            "is_valid": true | false,
            "confidence": <0.0-1.0>,
            "criteria_met": {{
                "full_arm_extension_bottom": true | false | "uncertain",
                "chin_above_bar": true | false | "uncertain",
                "controlled_movement": true | false | "uncertain",
                "no_excessive_kipping": true | false | "uncertain",
                "full_lockout_return": true | false | "uncertain"
            }},
            "invalid_reasons": ["reason1", "reason2"],
            "notes": "Any additional observations"
        }}
    ],
    "frame_observations": {{
        "frame_quality": "good" | "fair" | "poor",
        "visibility_issues": ["list any issues"],
        "key_frames": [
            {{
                "frame_description": "bottom position",
                "observation": "what you see"
            }}
        ]
    }},
    "recommendations": "Suggestions for the athlete or for video quality improvement"
}}
```

Analyze the frames now and provide your judgment:"""


def get_dip_prompt(camera_angle: str = "side") -> str:
    """Generate the analysis prompt for dip attempts."""
    
    return f"""STREET LIFTING DIP ANALYSIS

{DIP_REGULATIONS}

CAMERA ANGLE: {camera_angle.upper()} VIEW

Analyze the provided video frames and evaluate the dip attempt(s).

For EACH repetition visible in the frames, evaluate:

1. STARTING/TOP POSITION:
   - Are the arms fully extended (elbows locked)?
   - Is the body stable on the bars?
   - Are feet off the ground?

2. BOTTOM POSITION (DEPTH):
   - Are the upper arms at or BELOW parallel to the ground?
   - Is the shoulder crease at or below the elbow level?
   - Is the elbow angle approximately 90 degrees or less?

3. MOVEMENT QUALITY:
   - Is the descent controlled?
   - Is there no excessive swinging?
   - Does the athlete fully lock out at the top?

CRITICAL: The depth requirement is the most common point of failure.
Upper arms MUST be parallel to the ground or lower. The shoulder
crease MUST be at or below the top of the elbow.

Respond with the following JSON structure:
```json
{{
    "discipline": "dip",
    "total_reps_attempted": <number>,
    "valid_reps": <number>,
    "invalid_reps": <number>,
    "overall_judgment": "VALID" | "INVALID" | "NEEDS_REVIEW",
    "confidence": <0.0-1.0>,
    "rep_analysis": [
        {{
            "rep_number": 1,
            "is_valid": true | false,
            "confidence": <0.0-1.0>,
            "criteria_met": {{
                "full_arm_extension_top": true | false | "uncertain",
                "upper_arms_parallel_or_below": true | false | "uncertain",
                "shoulder_below_elbow": true | false | "uncertain",
                "controlled_movement": true | false | "uncertain",
                "no_excessive_swing": true | false | "uncertain"
            }},
            "invalid_reasons": ["reason1", "reason2"],
            "depth_assessment": {{
                "estimated_upper_arm_angle": "<angle or description>",
                "depth_achieved": "above_parallel" | "at_parallel" | "below_parallel"
            }},
            "notes": "Any additional observations"
        }}
    ],
    "frame_observations": {{
        "frame_quality": "good" | "fair" | "poor",
        "visibility_issues": ["list any issues"],
        "key_frames": [
            {{
                "frame_description": "bottom position",
                "observation": "what you see"
            }}
        ]
    }},
    "recommendations": "Suggestions for the athlete or for video quality improvement"
}}
```

Analyze the frames now and provide your judgment:"""


def get_squat_prompt(camera_angle: str = "side") -> str:
    """Generate the analysis prompt for squat attempts."""
    
    return f"""STREET LIFTING SQUAT ANALYSIS

{SQUAT_REGULATIONS}

CAMERA ANGLE: {camera_angle.upper()} VIEW

Analyze the provided video frames and evaluate the squat attempt(s).

For EACH repetition visible in the frames, evaluate:

1. STARTING/TOP POSITION:
   - Are hips and knees fully extended (standing tall)?
   - Is the athlete stable?
   - Is the bar properly positioned on the back?

2. BOTTOM POSITION (DEPTH):
   - Does the hip crease descend BELOW the top of the knee?
   - Is the thigh surface lower than parallel?
   - Has the athlete "broken parallel"?

3. MOVEMENT QUALITY:
   - Is the descent controlled?
   - Is there excessive forward lean?
   - Does the athlete achieve full lockout at the top?
   - Is the bar position stable throughout?

CRITICAL: The depth requirement is strictly enforced.
The HIP CREASE must go BELOW the top of the knee.
This is commonly called "breaking parallel."

Respond with the following JSON structure:
```json
{{
    "discipline": "squat",
    "total_reps_attempted": <number>,
    "valid_reps": <number>,
    "invalid_reps": <number>,
    "overall_judgment": "VALID" | "INVALID" | "NEEDS_REVIEW",
    "confidence": <0.0-1.0>,
    "rep_analysis": [
        {{
            "rep_number": 1,
            "is_valid": true | false,
            "confidence": <0.0-1.0>,
            "criteria_met": {{
                "full_hip_knee_extension_top": true | false | "uncertain",
                "hip_crease_below_knee": true | false | "uncertain",
                "controlled_movement": true | false | "uncertain",
                "stable_bar_position": true | false | "uncertain",
                "full_lockout_top": true | false | "uncertain"
            }},
            "invalid_reasons": ["reason1", "reason2"],
            "depth_assessment": {{
                "hip_crease_position": "above_knee" | "at_knee" | "below_knee",
                "estimated_thigh_angle": "<angle or description>",
                "parallel_achieved": true | false | "uncertain"
            }},
            "notes": "Any additional observations"
        }}
    ],
    "frame_observations": {{
        "frame_quality": "good" | "fair" | "poor",
        "visibility_issues": ["list any issues"],
        "key_frames": [
            {{
                "frame_description": "bottom position",
                "observation": "what you see"
            }}
        ]
    }},
    "recommendations": "Suggestions for the athlete or for video quality improvement"
}}
```

Analyze the frames now and provide your judgment:"""


def get_prompt_for_discipline(
    discipline: Discipline,
    camera_angle: str = "front",
    has_secondary_view: bool = False
) -> str:
    """Get the appropriate prompt for a discipline."""
    
    if discipline == Discipline.PULL_UP:
        return get_pull_up_prompt(camera_angle, has_secondary_view)
    elif discipline == Discipline.DIP:
        return get_dip_prompt(camera_angle)
    elif discipline == Discipline.SQUAT:
        return get_squat_prompt(camera_angle)
    else:
        raise ValueError(f"Unknown discipline: {discipline}")


def get_multi_angle_prompt(discipline: Discipline, angles: list) -> str:
    """
    Generate a prompt for analyzing multiple camera angles simultaneously.
    Useful when front view is insufficient for pull-ups.
    """
    
    angles_description = ", ".join(angles)
    
    return f"""MULTI-ANGLE VIDEO ANALYSIS

You are provided with video frames from MULTIPLE camera angles: {angles_description}

The frames are interleaved from different cameras. Use information from ALL angles
to make a comprehensive judgment.

For PULL-UPS specifically:
- Use the FRONT view to assess body position and stability
- Use the SIDE/PARALLEL view to confirm chin clearance above the bar

Cross-reference observations between angles to increase judgment confidence.

{get_prompt_for_discipline(discipline, "multiple")}
"""

