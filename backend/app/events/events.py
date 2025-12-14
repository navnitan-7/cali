from fastapi import APIRouter, Depends, HTTPException
from utils.db import db
from utils.variables import Event
from app.auth.auth import get_current_user

router = APIRouter(prefix="/events", tags=["events"])

@router.post("/create")
async def create_event(event: Event, current_user: dict = Depends(get_current_user)):
    try:
        # Use name as description if description is not provided
        description = event.description if event.description else event.name
        db.execute_action("INSERT INTO cali_db.events (name, description, event_type) VALUES (:name, :description, :event_type)", {"name": event.name, "description": description, "event_type": event.event_type})
        return {"message": "Event created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get")
async def get_events(current_user: dict = Depends(get_current_user)):
    return db.read("""
            SELECT events.id, events.name, events.description, et.name as event_type 
            FROM cali_db.events events
            INNER JOIN cali_db.event_type et ON events.event_type = et.id
    """)

@router.get("/list_event_type")
async def get_event_types(current_user: dict = Depends(get_current_user)):
    return db.read("SELECT * FROM cali_db.event_type")

@router.get("/by_participant/{id}")
async def get_events_by_participant(id: int, current_user: dict = Depends(get_current_user)):
    return db.read("""  
        SELECT events.id, events.name, events.description, et.name as event_type, pe.event_id, pe.participant_id 
        FROM cali_db.events events
        INNER JOIN cali_db.participants_events pe ON events.id = pe.event_id
        INNER JOIN cali_db.event_type et ON events.event_type = et.id
        WHERE pe.participant_id = :id
    """, {"id": id})

@router.get("/get/{id}")
async def get_event(id: int, current_user: dict = Depends(get_current_user)):
    return db.read("""
        SELECT events.id, events.name, events.description, et.name as event_type 
        FROM cali_db.events events
        INNER JOIN cali_db.event_type et ON events.event_type = et.id
        WHERE events.id = :id
    """, {"id": id})

@router.put("/update/{id}")
async def update_event(id: int, event: Event, current_user: dict = Depends(get_current_user)):
    return db.execute_action("""
        UPDATE cali_db.events SET name = :name, description = :description, event_type = :event_type WHERE id = :id
    """, {"id": id, "name": event.name, "description": event.description, "event_type": event.event_type})

@router.delete("/delete/{id}")
async def delete_event(id: int, current_user: dict = Depends(get_current_user)):
    return db.execute_action("""
        DELETE FROM cali_db.events WHERE id = :id
    """, {"id": id})