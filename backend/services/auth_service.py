import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session
from database import User

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-for-phishguard-ai-v2.4")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserSchema(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    is_email_connected: bool = False
    model_config = ConfigDict(from_attributes=True)

class AuthService:
    def verify_password(self, plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password):
        return pwd_context.hash(password)

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    def get_user(self, db: Session, username: str):
        return db.query(User).filter(User.username == username).first()

    def create_user(self, db: Session, user_data: dict):
        hashed_password = self.get_password_hash(user_data["password"])
        db_user = User(
            username=user_data["username"],
            full_name=user_data.get("full_name", ""),
            hashed_password=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    def update_user(self, db: Session, user: User, update_data: dict):
        if "full_name" in update_data:
            user.full_name = update_data["full_name"]
        
        if "new_password" in update_data and update_data["new_password"]:
            user.hashed_password = self.get_password_hash(update_data["new_password"])
        
        db.commit()
        db.refresh(user)
        return user
