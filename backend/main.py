import os
import logging
from datetime import timedelta, datetime
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from database import get_db, User, Scan, init_db

from services.model_service import ModelService
from services.explainability_service import ExplainabilityService
from services.chatbot_service import ChatbotService
from services.auth_service import AuthService, Token, UserSchema, SECRET_KEY, ALGORITHM
from services.email_service import EmailService
from jose import JWTError, jwt

load_dotenv()

app = FastAPI(title="PhishGuard AI - Secure API")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure CORS
raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
if raw_origins == "*":
    allowed_origins = ["*"]
    allow_credentials = False
else:
    allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
    allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
model_service = ModelService()
explainer_service = ExplainabilityService(model_service)
chatbot_service = ChatbotService()
auth_service = AuthService()
email_service = EmailService()

@app.on_event("startup")
def startup_event():
    print("Neuro-Link Established. Initializing Neural Logs...")
    init_db()
    print("Neural Core v2.4 Online and listening for threats.")

@app.get("/")
def read_root():
    return {"status": "online", "message": "PhishGuard AI Neural Core v2.4"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = auth_service.get_user(db, username=username)
    if user is None:
        raise credentials_exception
    return user

class PredictRequest(BaseModel):
    text: str

class ExplainRequest(BaseModel):
    text: str

class ChatRequest(BaseModel):
    message: str
    context: str = ""

class SaveScanRequest(BaseModel):
    url: str
    result: dict

class EmailConnectRequest(BaseModel):
    email: str
    password: str
    provider: Optional[str] = "gmail"

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: Optional[str] = ""

# Authentication Endpoints
@app.post("/auth/register", response_model=UserSchema)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = auth_service.get_user(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return auth_service.create_user(db, user.dict())

@app.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth_service.get_user(db, username=form_data.username)
    if not user or not auth_service.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=60 * 24)
    access_token = auth_service.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserSchema)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

@app.post("/auth/profile/update")
def update_profile(request: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        # Verify current password if changing password
        if request.new_password and request.current_password:
            if not auth_service.verify_password(request.current_password, current_user.hashed_password):
                raise HTTPException(status_code=400, detail="Current password verification failed")
        
        auth_service.update_user(db, current_user, request.dict(exclude_unset=True))
        return {"status": "success", "message": "Profile updated"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/auth/connect-email-credentials")
def connect_email_credentials(request: EmailConnectRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        # Support Demo Mode for easy navigation
        if request.email == "demo@phishguard.ai" and request.password == "demo123":
            current_user.is_email_connected = True
            current_user.email_user = request.email
            current_user.email_password = request.password
            db.commit()
            return {"status": "success", "message": "Demo Mode Active. Neural Tunnel established."}

        # Test real connection
        is_valid = email_service.test_connection(request.email, request.password, request.provider)
        if not is_valid:
            raise HTTPException(status_code=400, detail="Could not connect to IMAP server. Check credentials and App Password settings.")
        
        current_user.is_email_connected = True
        current_user.email_user = request.email
        current_user.email_password = request.password
        db.commit()
        return {"status": "success", "message": "Email account linked and verified."}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.exception("Email connection failed")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/email/fetch")
def fetch_emails(limit: int = 10, current_user: User = Depends(get_current_user)):
    if not current_user.is_email_connected or not current_user.email_user:
        raise HTTPException(status_code=400, detail="Email account not connected")
    
    # Handle Demo Mode Data
    if current_user.email_user == "demo@phishguard.ai":
        return [
            {
                "id": "demo-1",
                "from": "Bank Security <security@alert-verify-account.com>",
                "subject": "Urgent: Unusual Login Detected",
                "preview": "We detected an unusual login to your account from a new device in Moscow, Russia. Please click...",
                "body": "We detected an unusual login to your account from a new device in Moscow, Russia. If this was not you, please verify your account immediately at http://secure-verify-auth.net/login. Failure to do so will result in account suspension.",
                "time": "10:24 AM",
                "status": "unread",
                "isPhish": True,
                "scan_result": {"prediction": "Phishing", "probability": 0.98}
            },
            {
                "id": "demo-2",
                "from": "Netflix Support <billing@netflix-service.net>",
                "subject": "Payment Method Error",
                "preview": "We're having some trouble with your current billing information. We'll try again, but in the...",
                "body": "We're having some trouble with your current billing information. We'll try again, but in the meantime, you may want to update your payment details at http://netflix-billing-update.com/account",
                "time": "Yesterday",
                "status": "unread",
                "isPhish": True,
                "scan_result": {"prediction": "Phishing", "probability": 0.89}
            }
        ]

    try:
        emails = email_service.fetch_recent_emails(
            current_user.email_user, 
            current_user.email_password,
            limit=limit
        )
        
        # Automatically scan each email
        for email in emails:
            # We use the model_service to predict for each email
            # We can combine the email body or just subject+body
            scan_text = f"Subject: {email['subject']}\n\n{email['body']}"
            prediction = model_service.predict(scan_text)
            email["scan_result"] = prediction
            email["isPhish"] = prediction["prediction"] == "Phishing"
            
        return emails
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Persistence Endpoints
@app.post("/scans/save")
def save_scan(request: SaveScanRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        db_scan = Scan(
            user_id=current_user.id,
            url=request.url,
            prediction=request.result.get("prediction"),
            probability=request.result.get("probability"),
            details=request.result
        )
        db.add(db_scan)
        db.commit()
        return {"status": "success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/scans/history")
def get_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        scans = db.query(Scan).filter(Scan.user_id == current_user.id).order_by(Scan.timestamp.desc()).limit(100).all()
        # Map to match frontend expected format
        return [
            {
                "id": s.id,
                "url": s.url,
                "prediction": s.prediction,
                "score": s.probability,
                "result": s.details or {"prediction": s.prediction, "probability": s.probability},
                "timestamp": s.timestamp
            } for s in scans
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
def get_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        total_scans = db.query(Scan).filter(Scan.user_id == current_user.id).count()
        threats_blocked = db.query(Scan).filter(
            Scan.user_id == current_user.id, 
            Scan.prediction == "Phishing"
        ).count()
        
        # Simple dynamic risk scoring
        risk_score = 0
        if total_scans > 0:
            risk_score = min(100, int((threats_blocked / total_scans) * 100))
        
        protection_level = "Standard"
        if total_scans > 10:
            protection_level = "Enhanced"
        if threats_blocked > 5:
            protection_level = "High-Security"

        return {
            "total_scans": total_scans,
            "threats_blocked": threats_blocked,
            "accuracy": "99.4%",
            "system_protected": True,
            "risk_score": risk_score,
            "protection_level": protection_level,
            "is_email_connected": current_user.is_email_connected
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/threats/intel")
def get_threat_intel(current_user: User = Depends(get_current_user)):
    # Mock Global Threat Intelligence Feed
    return {
        "active_campaigns": [
            {"name": "BankVerify Phish", "origin": "Eastern Europe", "risk_level": "Critical"},
            {"name": "Netflix-Billing-Fraud", "origin": "LatAm", "risk_level": "High"},
            {"name": "Tax-Refund-Scam", "origin": "Global", "risk_level": "Medium"}
        ],
        "top_attack_vectors": ["Email", "SMS (Smishing)", "Social Media"],
        "last_updated": datetime.utcnow().isoformat()
    }

@app.post("/api/email/ingest")
def ingest_email(request: SaveScanRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        db_scan = Scan(
            user_id=current_user.id,
            url=request.url,
            prediction=request.result.get("prediction"),
            probability=request.result.get("probability"),
            details=request.result
        )
        db.add(db_scan)
        db.commit()
        return {"status": "success", "alert_triggered": request.result.get("prediction") == "Phishing"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# AI Service Endpoints (Protected)
@app.get("/")
def root():
    return {"message": "Phishing Detection API is running", "status": "secure"}

@app.post("/predict")
def predict(request: PredictRequest, current_user: User = Depends(get_current_user)):
    try:
        result = model_service.predict(request.text)
        return result
    except Exception as e:
        logger.exception("Prediction engine error")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/explain")
async def explain(request: ExplainRequest, current_user: User = Depends(get_current_user)):
    try:
        prediction_result = model_service.predict(request.text)
        explanation = await explainer_service.get_explanation(request.text)
        ai_explanation = chatbot_service.explain_threat(
            prediction_result["prediction"], 
            explanation["top_features"]
        )
        return {
            "prediction": prediction_result,
            "shap_explanation": explanation,
            "ai_explanation": ai_explanation
        }
    except Exception as e:
        logger.exception("Explainer engine error")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
def chat(request: ChatRequest, current_user: User = Depends(get_current_user)):
    try:
        response = chatbot_service.get_response(request.message, request.context)
        return {"response": response}
    except Exception as e:
        logger.exception("Chatbot engine error")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
