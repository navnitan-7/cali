from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, model_validator
from typing import Optional, Literal
from utils.db import db
from utils.variables import Activity
from app.auth.auth import get_current_user

router = APIRouter(prefix="/activity", tags=["activity"])

@router.post("/get_metrics/event_id/{event_id}")
def get_metrics(event_id: int, participant_id: int, current_user: dict = Depends(get_current_user)):
    if event_id == 1:
        select_columns = ["attempt_id", "time"]
    elif event_id == 2:
        select_columns = ["attempt_id", "weight", "type_of_activity", "is_success"]
    elif event_id == 3:
        select_columns = ["attempt_id", "time", "type_of_activity", "is_success"]
    elif event_id == 4:
        select_columns = ["attempt_id", "time", "type_of_activity", "is_success"]
    else:
        raise HTTPException(status_code=400, detail="Invalid event id")
    return db.read(f"SELECT {', '.join(select_columns)} FROM cali_db.activity WHERE event_id = :event_id AND participant_id = :participant_id", {"event_id": event_id, "participant_id": participant_id})

@router.post("/add_activity/")
def add_activity(activity: Activity, current_user: dict = Depends(get_current_user)):
    db.execute_action("INSERT INTO cali_db.activity (event_id, participant_id, attempt_id, weight, type_of_activity, reps, time, is_success, is_deleted) VALUES (:event_id, :participant_id, :attempt_id, :weight, :type_of_activity, :reps, :time, :is_success, :is_deleted)", {"event_id": activity.event_id, "participant_id": activity.participant_id, "attempt_id": activity.attempt_id, "weight": activity.weight, "type_of_activity": activity.type_of_activity, "reps": activity.reps, "time": activity.time, "is_success": activity.is_success, "is_deleted": activity.is_deleted})
    return {"message": "Activity added successfully"}