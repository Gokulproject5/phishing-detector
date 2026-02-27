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
                url="https://chatgpl.com",
                prediction="Legitimate",
                probability=0.005,
                details={"prediction": "Legitimate", "probability": 0.005, "all_probabilities": {"phishing": 0.005, "legitimate": 0.995}},
                timestamp=datetime.utcnow()
            ),
            Scan(
                user_id=user_id,
                url="https://chatgpt.com",
                prediction="Legitimate",
                probability=0.001,
                details={"prediction": "Legitimate", "probability": 0.001, "all_probabilities": {"phishing": 0.001, "legitimate": 0.999}},
                timestamp=datetime.utcnow()
            ),
            Scan(
                user_id=user_id,
                url="https://google.com",
                prediction="Legitimate",
                probability=0.01,
                details={"prediction": "Legitimate", "probability": 0.01, "all_probabilities": {"phishing": 0.01, "legitimate": 0.99}},
                timestamp=datetime.utcnow()
            )
        ]
        
        # Clear existing scans for this user in SQLite
        db.query(Scan).filter(Scan.user_id == user_id).delete()
        db.commit()
        
        db.add_all(dummy_scans)
        db.commit()
        print(f"Added {len(dummy_scans)} dummy scans successfully!")
            
        print("\n--- Seeding Complete ---")
        print(f"Login with: \nUsername: {username}\nPassword: password123")
        
    except Exception as e:
        print(f"Seeding failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
