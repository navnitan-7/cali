from fastapi import APIRouter
from sqlalchemy import text
from utils.variables import Participant
from utils.db import db

router = APIRouter(prefix="/participants", tags=["participants"])

@router.post("/create")
def create_participant(participant: Participant):
    # Use a connection with explicit transaction control
    with db.engine.begin() as conn:
        # Insert participant and get the ID
        result = conn.execute(
            text("INSERT INTO cali_db.participants (name, age, gender, weight, phone, country, state) VALUES (:name, :age, :gender, :weight, :phone, :country, :state) RETURNING id"),
            {"name": participant.name, "age": participant.age, "gender": participant.gender, "weight": participant.weight, "phone": participant.phone, "country": participant.country, "state": participant.state}
        )
        participant_id = result.fetchone()[0]
                
        # Insert participant-event associations in the same transaction
        for event in participant.event_id:
            print(f"DEBUG: Inserting participant_id={participant_id}, event_id={event}")
            conn.execute(
                text("INSERT INTO cali_db.participants_events (participant_id, event_id) VALUES (:participant_id, :event_id)"),
                {"participant_id": participant_id, "event_id": event}
            )
        
        # Transaction will auto-commit on successful exit from context manager
        return {"message": "Participant created successfully", "participant_id": participant_id}

@router.get("/get")
def get_participants():
    return db.read("SELECT * FROM cali_db.participants")

@router.get("/get/{id}")
def get_participant(id: int):
    return db.read("SELECT * FROM cali_db.participants WHERE id = :id", {"id": id})

@router.put("/update/{id}")
def update_participant(id: int, participant: Participant):
    db.execute_action("UPDATE cali_db.participants SET name = :name, age = :age, gender = :gender, weight = :weight, phone = :phone, country = :country, state = :state WHERE id = :id", {"name": participant.name, "age": participant.age, "gender": participant.gender, "weight": participant.weight, "phone": participant.phone, "country": participant.country, "state": participant.state, "id": id})
    return {"message": "Participant updated successfully"}