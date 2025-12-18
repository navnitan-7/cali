from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.participants import participants
from app.events import events
from app.activity import activity
from app.auth import auth
from app.video_judge import video_judge

app = FastAPI(
    title="Street Lifting Competition API",
    description="API for managing street lifting competitions with AI-powered video judging",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(participants.router)
app.include_router(events.router)
app.include_router(activity.router)
app.include_router(auth.router)
app.include_router(video_judge.router)

@app.get("/")
async def read_root():
    return {"message": "Street Lifting Competition API - v2.0.0"}