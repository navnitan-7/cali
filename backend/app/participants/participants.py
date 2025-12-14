from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from utils.variables import Participant
from utils.db import db
from app.auth.auth import get_current_user, verify_token

router = APIRouter(prefix="/participants", tags=["participants"])

@router.post("/create")
async def create_participant(participant: Participant, current_user: dict = Depends(get_current_user)):
    # Validate that at least one event is present
    if not participant.event_id or len(participant.event_id) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one event must be selected"
        )
    
    # Use a connection with explicit transaction control
    with db.engine.begin() as conn:
        # Insert participant and get the ID
        result = conn.execute(
            text("INSERT INTO cali_db.participants (name, age, gender, weight, phone, country, state) VALUES (:name, :age, :gender, :weight, :phone, :country, :state) RETURNING id"),
            {"name": participant.name, "age": participant.age, "gender": participant.gender, "weight": participant.weight, "phone": participant.phone, "country": participant.country, "state": participant.state}
        )
        participant_id = result.fetchone()[0]
                
        # Insert participant-event associations in the same transaction using bulk insert
        event_params = [{"participant_id": participant_id, "event_id": event} for event in participant.event_id]
        conn.execute(
            text("INSERT INTO cali_db.participants_events (participant_id, event_id) VALUES (:participant_id, :event_id)"),
            event_params
        )
        
        # Transaction will auto-commit on successful exit from context manager
        return {"message": "Participant created successfully", "participant_id": participant_id}

@router.get("/get")
async def get_participants(current_user: dict = Depends(get_current_user)):
    return db.read("""
    SELECT participants.*, e.name as event_name, et.name as event_type
    FROM cali_db.participants participants
    INNER JOIN cali_db.participants_events pe ON participants.id = pe.participant_id
    INNER JOIN cali_db.events e ON pe.event_id = e.id
    INNER JOIN cali_db.event_type et ON e.event_type = et.id
    """)

@router.get("/by_event/{id}")
async def get_participants_by_event(id: int, current_user: dict = Depends(get_current_user)):
    return db.read("""
        SELECT p.*, pe.event_id, pe.participant_id 
        FROM cali_db.participants p
        INNER JOIN cali_db.participants_events pe ON p.id = pe.participant_id
        INNER JOIN cali_db.events e ON pe.event_id = e.id
        INNER JOIN cali_db.event_type et ON e.event_type = et.id 
        WHERE pe.event_id = :id
    """, {"id": id})

@router.get("/get/{id}")
async def get_participant_details(id: int, _: bool = Depends(verify_token)):
    return db.read("SELECT * FROM cali_db.participants WHERE id = :id", {"id": id})

@router.put("/update/{id}")
async def update_participant(id: int, participant: Participant, current_user: dict = Depends(get_current_user)):
    # Validate that at least one event is present if event_id is provided
    if participant.event_id is not None and len(participant.event_id) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one event must be selected"
        )
    
    # Use a connection with explicit transaction control
    with db.engine.begin() as conn:
        # Update participant basic info
        conn.execute(
            text("UPDATE cali_db.participants SET name = :name, age = :age, gender = :gender, weight = :weight, phone = :phone, country = :country, state = :state WHERE id = :id"),
            {"name": participant.name, "age": participant.age, "gender": participant.gender, "weight": participant.weight, "phone": participant.phone, "country": participant.country, "state": participant.state, "id": id}
        )
        
        # Update participant-event associations if event_id is provided
        if participant.event_id is not None:
            # Delete existing associations
            conn.execute(
                text("DELETE FROM cali_db.participants_events WHERE participant_id = :participant_id"),
                {"participant_id": id}
            )
            
            # Insert new associations
            event_params = [{"participant_id": id, "event_id": event} for event in participant.event_id]
            conn.execute(
                text("INSERT INTO cali_db.participants_events (participant_id, event_id) VALUES (:participant_id, :event_id)"),
                event_params
            )
        
        # Transaction will auto-commit on successful exit from context manager
        return {"message": "Participant updated successfully"}