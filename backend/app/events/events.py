from fastapi import APIRouter
from utils.db import db
from utils.variables import Event
from fastapi import HTTPException
router = APIRouter(prefix="/events", tags=["events"])

@router.post("/create")
def create_event(event: Event):
    try:
        print(event.name, event.description, event.event_type)
        db.execute_action("INSERT INTO cali_db.events (name, description, event_type) VALUES (:name, :description, :event_type)", {"name": event.name, "description": event.description, "event_type": event.event_type})
        return {"message": "Event created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/get")
def get_events():
    return db.read("""
            SELECT events.id, events.name, events.description, et.name as event_type 
            FROM cali_db.events events
            INNER JOIN cali_db.event_type et ON events.event_type = et.id
    """)

@router.get("/list_event_type")
def get_event_types():
    return db.read("SELECT * FROM cali_db.event_type")

@router.get("/by_participant/{id}")
def get_events_by_participant(id: int):
    return db.read("""
        SELECT events.id, events.name, events.description, et.name as event_type, pe.event_id, pe.participant_id 
        FROM cali_db.events events
        INNER JOIN cali_db.participants_events pe ON events.id = pe.event_id
        INNER JOIN cali_db.event_type et ON events.event_type = et.id
        WHERE pe.participant_id = :id
    """, {"id": id})

@router.get("/get/{id}")
def get_event(id: int):
    return db.read("""
        SELECT events.id, events.name, events.description, et.name as event_type 
        FROM cali_db.events events
        INNER JOIN cali_db.event_type et ON events.event_type = et.id
        WHERE events.id = :id
    """, {"id": id})