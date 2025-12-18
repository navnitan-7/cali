"""
International Street Lifting Federation (ISL) - Technical Regulations
Reference document for AI video judging system

These regulations are based on the World Street Lifting Federation standards
and define the criteria for valid attempts in pull-ups, dips, and squats.
"""

from dataclasses import dataclass
from enum import Enum
from typing import List


class Discipline(str, Enum):
    PULL_UP = "pull_up"
    DIP = "dip"
    SQUAT = "squat"


class JudgmentResult(str, Enum):
    VALID = "valid"
    INVALID = "invalid"
    NEEDS_REVIEW = "needs_review"


@dataclass
class InvalidReason:
    code: str
    description: str
    severity: str  # "minor", "major", "critical"


# ============================================================================
# PULL-UP REGULATIONS
# ============================================================================

PULL_UP_REGULATIONS = """
## PULL-UP TECHNICAL REGULATIONS

### Starting Position:
1. Athlete must hang from the bar with arms FULLY EXTENDED (dead hang position)
2. Grip can be pronated (overhand), supinated (underhand), or neutral
3. Body must be still before starting the repetition
4. Feet must not touch the ground

### Upward Phase (Concentric):
1. Athlete pulls body upward in a controlled manner
2. NO excessive kipping, swinging, or butterfly motion allowed
3. Movement must be primarily driven by upper body strength

### Top Position (Completion Criteria):
1. CHIN must CLEARLY pass ABOVE the horizontal plane of the bar
2. The chin must break the plane - touching the bar is not sufficient if chin doesn't clear it
3. Momentary pause at the top is recommended but not required

### Downward Phase (Eccentric):
1. Athlete must lower body in a CONTROLLED manner
2. Arms must return to FULL EXTENSION (dead hang)
3. Complete lockout of elbows required before next repetition
4. No bouncing or using momentum from the descent

### Common Invalid Attempts:
- Chin does not clear the bar (NO REP)
- Arms not fully extended at bottom (NO REP)
- Excessive kipping or swinging (NO REP)
- Legs used to generate upward momentum (NO REP)
- Grip release during repetition (NO REP)

### Camera Requirements:
- PRIMARY: Front-facing camera to verify chin clears bar
- SECONDARY (if needed): Side view parallel to bar to confirm bar clearance
"""

PULL_UP_VISUAL_CRITERIA = {
    "starting_position": [
        "Arms fully extended (straight elbows)",
        "Body hanging still (no swing)",
        "Feet off the ground",
    ],
    "top_position": [
        "Chin visibly above the bar horizontal plane",
        "Clear daylight between chin and bar level",
    ],
    "bottom_position": [
        "Full arm extension (elbow lockout)",
        "Dead hang achieved before next rep",
    ],
    "movement_quality": [
        "Controlled ascent without excessive kipping",
        "No butterfly or CrossFit-style motion",
        "Minimal body swing",
    ],
}

PULL_UP_INVALID_REASONS = [
    InvalidReason("PU001", "Chin did not clear the bar", "critical"),
    InvalidReason("PU002", "Arms not fully extended at start/bottom", "major"),
    InvalidReason("PU003", "Excessive kipping or swinging motion", "major"),
    InvalidReason("PU004", "Leg kick used for momentum", "major"),
    InvalidReason("PU005", "Grip release during repetition", "critical"),
    InvalidReason("PU006", "Feet touched ground during rep", "critical"),
    InvalidReason("PU007", "Incomplete range of motion", "major"),
]


# ============================================================================
# DIP REGULATIONS
# ============================================================================

DIP_REGULATIONS = """
## DIP TECHNICAL REGULATIONS

### Starting Position:
1. Athlete must be supported on parallel bars or dip station
2. Arms must be FULLY EXTENDED (elbows locked out)
3. Body should be relatively vertical (slight forward lean acceptable)
4. Feet must not touch the ground

### Downward Phase (Eccentric):
1. Athlete lowers body in a CONTROLLED manner
2. Upper arms must descend until they are AT LEAST PARALLEL to the ground
3. The shoulder joint must break below the elbow joint plane
4. Angle at elbow should reach approximately 90 degrees or less

### Bottom Position (Depth Criteria):
1. Upper arm must be PARALLEL to ground or below
2. The crease of the shoulder must be at or below the top of the elbow
3. Momentary pause at bottom is recommended but not required

### Upward Phase (Concentric):
1. Athlete pushes body upward in a controlled manner
2. Movement must continue until arms are FULLY EXTENDED
3. Complete elbow lockout required at top
4. No excessive swinging or kipping

### Common Invalid Attempts:
- Insufficient depth (upper arms not parallel) (NO REP)
- Arms not fully locked out at top (NO REP)
- Excessive swinging or momentum (NO REP)
- Feet touched ground during rep (NO REP)
- Grip release or repositioning (NO REP)

### Camera Requirements:
- REQUIRED: Side angle view to accurately assess depth and arm angle
- The camera should be perpendicular to the athlete's sagittal plane
"""

DIP_VISUAL_CRITERIA = {
    "starting_position": [
        "Arms fully extended with elbow lockout",
        "Body stable on the bars",
        "Feet clear of the ground",
    ],
    "bottom_position": [
        "Upper arms at or below parallel to ground",
        "Shoulder crease at or below elbow level",
        "Elbow angle approximately 90 degrees or less",
    ],
    "top_position": [
        "Full arm extension",
        "Complete elbow lockout",
        "Controlled finish",
    ],
    "movement_quality": [
        "Controlled descent",
        "No excessive swinging",
        "Smooth transition at bottom",
    ],
}

DIP_INVALID_REASONS = [
    InvalidReason("DIP001", "Insufficient depth - upper arms not parallel", "critical"),
    InvalidReason("DIP002", "Arms not fully locked out at top", "major"),
    InvalidReason("DIP003", "Excessive swinging or momentum", "major"),
    InvalidReason("DIP004", "Feet touched ground during rep", "critical"),
    InvalidReason("DIP005", "Grip release or hand repositioning", "critical"),
    InvalidReason("DIP006", "Incomplete range of motion", "major"),
]


# ============================================================================
# SQUAT REGULATIONS
# ============================================================================

SQUAT_REGULATIONS = """
## SQUAT TECHNICAL REGULATIONS

### Starting Position:
1. Athlete stands with barbell on upper back (high bar or low bar position)
2. Feet should be shoulder-width apart (stance may vary)
3. Knees and hips must be FULLY EXTENDED (standing tall)
4. Athlete must be stable before beginning descent

### Downward Phase (Eccentric):
1. Athlete descends in a CONTROLLED manner
2. Hips move back and down
3. Knees track over toes (may go past toes depending on mobility)
4. Descent continues until proper depth is achieved

### Bottom Position (Depth Criteria):
1. The hip crease must descend BELOW the top of the knee
2. The top surface of the thigh at the hip must be lower than the knee
3. This is commonly referred to as "breaking parallel"
4. Depth must be achieved in a controlled manner (no bouncing)

### Upward Phase (Concentric):
1. Athlete drives upward from the bottom position
2. Hips and knees extend together
3. Movement continues until fully standing
4. Complete hip and knee lockout required at top

### Common Invalid Attempts:
- Hip crease did not break below knee (NO REP)
- Did not achieve full lockout at top (NO REP)
- Loss of balance or step during lift (NO REP)
- Bar slipped or moved significantly (NO REP)
- Excessive forward lean causing near-failure (subjective)

### Camera Requirements:
- REQUIRED: Side angle view to accurately assess squat depth
- Camera should be positioned at hip height
- Clear view of hip crease and knee required
"""

SQUAT_VISUAL_CRITERIA = {
    "starting_position": [
        "Full hip and knee extension",
        "Athlete standing tall and stable",
        "Bar properly positioned on back",
    ],
    "bottom_position": [
        "Hip crease below top of knee",
        "Thigh surface lower than parallel",
        "Breaking parallel achieved",
    ],
    "top_position": [
        "Full hip extension (standing tall)",
        "Full knee extension (lockout)",
        "Controlled stable finish",
    ],
    "movement_quality": [
        "Controlled descent",
        "No excessive forward lean",
        "Stable bar position throughout",
        "Balanced foot pressure",
    ],
}

SQUAT_INVALID_REASONS = [
    InvalidReason("SQ001", "Hip crease did not break below knee (depth)", "critical"),
    InvalidReason("SQ002", "Did not achieve full lockout at top", "major"),
    InvalidReason("SQ003", "Loss of balance or step during lift", "critical"),
    InvalidReason("SQ004", "Bar slipped or moved significantly", "major"),
    InvalidReason("SQ005", "Incomplete range of motion", "major"),
    InvalidReason("SQ006", "Excessive forward lean / good morning squat", "major"),
]


# ============================================================================
# COMBINED REFERENCE
# ============================================================================

REGULATIONS_BY_DISCIPLINE = {
    Discipline.PULL_UP: {
        "text": PULL_UP_REGULATIONS,
        "visual_criteria": PULL_UP_VISUAL_CRITERIA,
        "invalid_reasons": PULL_UP_INVALID_REASONS,
    },
    Discipline.DIP: {
        "text": DIP_REGULATIONS,
        "visual_criteria": DIP_VISUAL_CRITERIA,
        "invalid_reasons": DIP_INVALID_REASONS,
    },
    Discipline.SQUAT: {
        "text": SQUAT_REGULATIONS,
        "visual_criteria": SQUAT_VISUAL_CRITERIA,
        "invalid_reasons": SQUAT_INVALID_REASONS,
    },
}


def get_regulation_text(discipline: Discipline) -> str:
    """Get the full regulation text for a discipline."""
    return REGULATIONS_BY_DISCIPLINE[discipline]["text"]


def get_visual_criteria(discipline: Discipline) -> dict:
    """Get the visual criteria checklist for a discipline."""
    return REGULATIONS_BY_DISCIPLINE[discipline]["visual_criteria"]


def get_invalid_reasons(discipline: Discipline) -> List[InvalidReason]:
    """Get possible invalid reasons for a discipline."""
    return REGULATIONS_BY_DISCIPLINE[discipline]["invalid_reasons"]

