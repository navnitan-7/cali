"""
This module is used to sync the data from the database to the Google Sheet.
"""

from fastapi import APIRouter
from utils.db import db
import gspread
from google.oauth2.service_account import Credentials
import os
from sqlalchemy import text

router = APIRouter(prefix="/sheets_sync", tags=["sheets_sync"])

@router.post("/sync")
def sync_sheets():
    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    creds = Credentials.from_service_account_file(os.getenv("GOOGLE_SHEETS_CREDS_PATH"), scopes=scope)
    client = gspread.authorize(creds)
    
    sheet = client.open_by_key(os.getenv("GOOGLE_SHEET_ID"))
    worksheet = sheet.get_worksheet(0)
    
    data = worksheet.get_all_records()
    
    participants_added = 0
    associations_added = 0
    
    with db.engine.begin() as conn:
        for row in data:
            name = row.get('name')
            age = row.get('age')
            gender = row.get('gender')
            weight = row.get('weight')
            phone = row.get('phone')
            country = row.get('country')
            state = row.get('state')
            events_str = row.get('events', '')
            
            existing = conn.execute(
                text("SELECT id FROM cali_db.participants WHERE phone = :phone"),
                {"phone": phone}
            ).fetchone()
            
            if existing:
                participant_id = existing[0]
            else:
                result = conn.execute(
                    text("INSERT INTO cali_db.participants (name, age, gender, weight, phone, country, state) VALUES (:name, :age, :gender, :weight, :phone, :country, :state) RETURNING id"),
                    {"name": name, "age": age, "gender": gender, "weight": weight, "phone": phone, "country": country, "state": state}
                )
                participant_id = result.fetchone()[0]
                participants_added += 1
            
            if events_str:
                event_names = [e.strip() for e in str(events_str).split(',')]
                
                for event_name in event_names:
                    if event_name:
                        event_result = conn.execute(
                            text("SELECT id FROM cali_db.events WHERE name = :name"),
                            {"name": event_name}
                        ).fetchone()
                        
                        if event_result:
                            event_id = event_result[0]
                            
                            existing_assoc = conn.execute(
                                text("SELECT 1 FROM cali_db.participants_events WHERE participant_id = :participant_id AND event_id = :event_id"),
                                {"participant_id": participant_id, "event_id": event_id}
                            ).fetchone()
                            
                            if not existing_assoc:
                                conn.execute(
                                    text("INSERT INTO cali_db.participants_events (participant_id, event_id) VALUES (:participant_id, :event_id)"),
                                    {"participant_id": participant_id, "event_id": event_id}
                                )
                                associations_added += 1
    
    return {
        "message": "Sheets synced successfully",
        "participants_added": participants_added,
        "associations_added": associations_added
    }