"""
Video Upload Module - Uploads participant videos to Google Drive
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
import os
import io
import uuid
from datetime import datetime

router = APIRouter(prefix="/video_upload", tags=["video_upload"])

# Google Drive folder ID where videos will be stored
# You can set this in environment variable or use root folder
DRIVE_FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID", None)

def get_drive_service():
    """Get authenticated Google Drive service"""
    scope = [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file'
    ]
    creds_path = os.getenv("GOOGLE_SHEETS_CREDS_PATH")
    if not creds_path:
        raise HTTPException(status_code=500, detail="Google credentials not configured")
    
    creds = Credentials.from_service_account_file(creds_path, scopes=scope)
    service = build('drive', 'v3', credentials=creds)
    return service


@router.post("/upload")
async def upload_video(
    file: UploadFile = File(...),
    participant_name: str = Form(...),
    participant_id: int = Form(...),
    event_name: str = Form(...),
    event_id: int = Form(...),
    category: str = Form(None),
    tournament_name: str = Form(None),
):
    """
    Upload a video to Google Drive with participant and event information.
    Returns the shareable link to the uploaded video.
    """
    try:
        # Validate file is a video
        content_type = file.content_type or ""
        if not content_type.startswith("video/"):
            raise HTTPException(status_code=400, detail="File must be a video")
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        
        # Sanitize names for filename
        safe_participant_name = "".join(c for c in participant_name if c.isalnum() or c in " _-").strip().replace(" ", "_")
        safe_event_name = "".join(c for c in event_name if c.isalnum() or c in " _-").strip().replace(" ", "_")
        safe_category = ""
        if category:
            safe_category = "_" + "".join(c for c in category if c.isalnum() or c in " _-").strip().replace(" ", "_")
        
        # Get original file extension
        original_filename = file.filename or "video.mp4"
        extension = os.path.splitext(original_filename)[1] or ".mp4"
        
        # Create filename: ParticipantName_EventName_Category_Timestamp_UniqueID.ext
        filename = f"{safe_participant_name}_{safe_event_name}{safe_category}_{timestamp}_{unique_id}{extension}"
        
        # Read file content
        file_content = await file.read()
        
        # Get Drive service
        service = get_drive_service()
        
        # Prepare file metadata
        file_metadata = {
            'name': filename,
            'description': f"Participant: {participant_name}\nEvent: {event_name}\nCategory: {category or 'N/A'}\nTournament: {tournament_name or 'N/A'}\nParticipant ID: {participant_id}\nEvent ID: {event_id}"
        }
        
        # Add to specific folder if configured
        if DRIVE_FOLDER_ID:
            file_metadata['parents'] = [DRIVE_FOLDER_ID]
        
        # Create media upload
        media = MediaIoBaseUpload(
            io.BytesIO(file_content),
            mimetype=content_type,
            resumable=True
        )
        
        # Upload file
        uploaded_file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, name, webViewLink, webContentLink'
        ).execute()
        
        # Make the file publicly viewable (anyone with link)
        service.permissions().create(
            fileId=uploaded_file['id'],
            body={
                'type': 'anyone',
                'role': 'reader'
            }
        ).execute()
        
        # Get the shareable link
        file_info = service.files().get(
            fileId=uploaded_file['id'],
            fields='webViewLink, webContentLink'
        ).execute()
        
        return {
            "success": True,
            "message": "Video uploaded successfully",
            "file_id": uploaded_file['id'],
            "file_name": filename,
            "view_link": file_info.get('webViewLink'),
            "download_link": file_info.get('webContentLink'),
            "participant_name": participant_name,
            "event_name": event_name,
            "category": category
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error uploading video: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to upload video: {str(e)}")


@router.get("/status/{file_id}")
async def get_video_status(file_id: str):
    """
    Check if a video exists and get its information
    """
    try:
        service = get_drive_service()
        
        file_info = service.files().get(
            fileId=file_id,
            fields='id, name, webViewLink, webContentLink, size, createdTime'
        ).execute()
        
        return {
            "success": True,
            "file_id": file_info['id'],
            "file_name": file_info['name'],
            "view_link": file_info.get('webViewLink'),
            "download_link": file_info.get('webContentLink'),
            "size": file_info.get('size'),
            "created_time": file_info.get('createdTime')
        }
        
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Video not found: {str(e)}")

