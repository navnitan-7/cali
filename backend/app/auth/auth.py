from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from utils.db import db
from utils.auth import hash_password, verify_password, create_access_token, decode_access_token
from utils.variables import UserRegister, UserLogin, Token
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    try:
        query = "SELECT * FROM cali_db.users WHERE name = :name"
        db_user = db.read(query, {"name": user.name})
        
        if not db_user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        db_user = db_user[0]
        
        if not await verify_password(user.password, db_user["password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        access_token = await create_access_token(
            data={"sub": db_user["name"], "user_id": db_user["id"]},
            expires_delta=timedelta(minutes=30)
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        # Re-raise HTTP exceptions (like 401) as-is
        raise
    except Exception as e:
        # Log the error for debugging
        logger.error(f"Login error: {str(e)}", exc_info=True)
        # Return a generic error message to avoid exposing internal details
        raise HTTPException(
            status_code=500,
            detail="An error occurred during login. Please try again later."
        )

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify token validity without fetching user from database"""
    token = credentials.credentials
    payload = await decode_access_token(token)
    
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    name = payload.get("sub")
    if name is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Token is valid, return True or minimal info
    return True

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = await decode_access_token(token)
        
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
    except HTTPException:
        # Re-raise HTTP exceptions (like 401) as-is
        raise
    except Exception as e:
        # Log the error for debugging
        logger.error(f"get_current_user error: {str(e)}", exc_info=True)
        # Return a generic error message to avoid exposing internal details
        raise HTTPException(
            status_code=500,
            detail="An error occurred while fetching user information."
        )

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
