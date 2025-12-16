import sys
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from utils.db import db
from utils.variables import Activity
from app.auth.auth import get_current_user

ACTIVITY_FIELDS_BY_EVENT = {
    1: ["attempt_id", "time", "is_success"],
    2: ["attempt_id", "weight", "type_of_activity", "is_success"],
    3: ["attempt_id", "time", "type_of_activity", "is_success"],
    4: ["attempt_id", "time", "type_of_activity", "is_success"]
}

MAX_ATTEMPTS_PER_EVENT = {
    1: 1,
    2: 6,
    3: 1,
    4: 1
}

router = APIRouter(prefix="/activity", tags=["activity"])

@router.post("/get_metrics/event_id/{event_id}")
async def get_metrics(event_id: int, participant_id: int, event_type: int, current_user: dict = Depends(get_current_user)):
    # Get fields from constants based on event_type
    if event_type not in ACTIVITY_FIELDS_BY_EVENT:
        raise HTTPException(status_code=400, detail="Invalid event type")
    
    select_columns = ACTIVITY_FIELDS_BY_EVENT[event_type]
    return db.read(f"SELECT {', '.join(select_columns)} FROM cali_db.activity WHERE event_id = :event_id AND participant_id = :participant_id", {"event_id": event_id, "participant_id": participant_id})

@router.post("/add_activity/")
async def add_activity(activity: Activity, current_user: dict = Depends(get_current_user)):
    # Validate event_type exists in constants
    print(activity.event_id)
    if activity.event_type not in ACTIVITY_FIELDS_BY_EVENT:
        raise HTTPException(status_code=400, detail="Invalid event type")
    
    # Get required fields for this event_type
    required_fields = set(ACTIVITY_FIELDS_BY_EVENT[activity.event_type])
    
    # Validate that required fields are provided based on event_type
    # attempt_id is always required in the model, so no need to check
    
    if "time" in required_fields and activity.time is None:
        raise HTTPException(status_code=400, detail="time is required for this event")
    
    if "weight" in required_fields and activity.weight is None:
        raise HTTPException(status_code=400, detail="weight is required for this event")
    
    if "type_of_activity" in required_fields and (not activity.type_of_activity or activity.type_of_activity.strip() == ""):
        raise HTTPException(status_code=400, detail="type_of_activity is required for this event")
    
    if "is_success" in required_fields and activity.is_success is None:
        raise HTTPException(status_code=400, detail="is_success is required for this event")
    
    db.execute_action("INSERT INTO cali_db.activity (event_id, participant_id, attempt_id, weight, type_of_activity, reps, time, is_success, is_deleted) VALUES (:event_id, :participant_id, :attempt_id, :weight, :type_of_activity, :reps, :time, :is_success, :is_deleted)", {"event_id": activity.event_id, "participant_id": activity.participant_id, "attempt_id": activity.attempt_id, "weight": activity.weight, "type_of_activity": activity.type_of_activity, "reps": activity.reps, "time": activity.time, "is_success": activity.is_success, "is_deleted": activity.is_deleted})
    return {"message": "Activity added successfully"}

@router.put("/update_activity/")
async def update_activity(activity: Activity, current_user: dict = Depends(get_current_user)):
    # Validate event_id exists in constants
    print(activity.event_id)
    print(activity.attempt_id)
    print(MAX_ATTEMPTS_PER_EVENT[activity.event_id])
    print(activity.time)
    if activity.event_type not in ACTIVITY_FIELDS_BY_EVENT:
        raise HTTPException(status_code=400, detail="Invalid event id")
    
    # Get required fields for this event_type and check if the attempt_id is valid
    required_fields = set(ACTIVITY_FIELDS_BY_EVENT[activity.event_type])
    max_attempts = MAX_ATTEMPTS_PER_EVENT[activity.event_type]
    if not (1 <= activity.attempt_id <= max_attempts):
        raise HTTPException(status_code=400, detail="Invalid attempt id")
    
    # Validate that required fields are provided based on event_type
    if "time" in required_fields and activity.time is None:
        raise HTTPException(status_code=400, detail="time is required for this event")
    
    if "weight" in required_fields and activity.weight is None:
        raise HTTPException(status_code=400, detail="weight is required for this event")
    
    if "type_of_activity" in required_fields and (not activity.type_of_activity or activity.type_of_activity.strip() == ""):
        raise HTTPException(status_code=400, detail="type_of_activity is required for this event")
    
    if "is_success" in required_fields and activity.is_success is None:
        raise HTTPException(status_code=400, detail="is_success is required for this event")
    
    db.execute_action("UPDATE cali_db.activity SET time = :time, weight = :weight, type_of_activity = :type_of_activity, is_success = :is_success WHERE event_id = :event_id AND participant_id = :participant_id AND attempt_id = :attempt_id", {"event_id": activity.event_id, "participant_id": activity.participant_id, "attempt_id": activity.attempt_id, "time": activity.time, "weight": activity.weight, "type_of_activity": activity.type_of_activity, "is_success": activity.is_success})
    return {"message": "Activity updated successfully"}