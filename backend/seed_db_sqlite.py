from sqlalchemy.orm import Session
from database import SessionLocal, User, Scan, Base, engine
from services.auth_service import AuthService
from datetime import datetime

# Initialize auth service for password hashing
auth_service = AuthService()

def seed_db():
    print("Initializing SQLite Database...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Create Test User
        username = "testuser"
        existing_user = db.query(User).filter(User.username == username).first()
        
        if not existing_user:
            print(f"Creating user: {username}")
            db_user = User(
                username=username,
                full_name="Test Security Analyst",
                hashed_password=auth_service.get_password_hash("password123")
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            user_id = db_user.id
            print(f"User created with ID: {user_id}")
        else:
            print(f"User {username} already exists.")
            user_id = existing_user.id

        # 2. Add Dummy Scan History
        print("Adding dummy scan history...")
        dummy_scans = [
            Scan(
                user_id=user_id,
                url="http://secure-bank-login.com/verify",
                prediction="Phishing",
                probability=0.98,
                details={"prediction": "Phishing", "probability": 0.98},
                timestamp=datetime.utcnow()
            ),
            Scan(
                user_id=user_id,
                url="https://google.com",
                prediction="Legitimate",
                probability=0.01,
                details={"prediction": "Legitimate", "probability": 0.01},
                timestamp=datetime.utcnow()
            )
        ]
        
        # Add scans if history is empty
        history_count = db.query(Scan).filter(Scan.user_id == user_id).count()
        if history_count == 0:
            db.add_all(dummy_scans)
            db.commit()
            print("Dummy scans added successfully!")
        else:
            print(f"User already has {history_count} scans. Skipping dummy data.")
            
        print("\n--- Seeding Complete ---")
        print(f"Login with: \nUsername: {username}\nPassword: password123")
        
    except Exception as e:
        print(f"Seeding failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
