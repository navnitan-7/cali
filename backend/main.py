from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.participants import participants
from app.events import events
from app.activity import activity
from app.auth import auth

app = FastAPI()

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

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}