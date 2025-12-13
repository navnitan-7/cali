from pydantic import BaseModel
from typing import Literal

class Participant(BaseModel):
    name: str
    age: int
    gender: str
    weight: float
    phone: str
    country: str
    state: str
    event_id: list[int]

class Event(BaseModel):
    name: str
    description: str
    event_type: int

class Activity(BaseModel):
    event_id: int
    participant_id: int
    attempt_id: int
    weight: float | None = None
    type_of_activity: str
    reps: int | None = None
    time: float | None = None
    is_success: bool | None = None
    is_deleted: bool | None = None

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    name: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    name: str | None = None
