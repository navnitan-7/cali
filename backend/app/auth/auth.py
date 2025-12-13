from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from utils.db import db
from utils.auth import hash_password, verify_password, create_access_token, decode_access_token
from utils.variables import UserRegister, UserLogin, Token
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    query = "SELECT * FROM cali_db.users WHERE name = :name"
    db_user = db.read(query, {"name": user.name})
    
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    db_user = db_user[0]
    
    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(
        data={"sub": db_user["name"], "user_id": db_user["id"]},
        expires_delta=timedelta(minutes=30)
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    name = payload.get("sub")
    if name is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    query = "SELECT * FROM cali_db.users WHERE name = :name"
    user = db.read(query, {"name": name})
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user[0]

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
