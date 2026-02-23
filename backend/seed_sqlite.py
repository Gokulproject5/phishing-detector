from sqlalchemy.orm import Session
from database import SessionLocal, User, init_db
from services.auth_service import AuthService
import datetime

def seed_sqlite():
    print("Initializing Database...")
    init_db()
    db = SessionLocal()
    auth_service = AuthService()

    # Create a test user
    username = "testuser"
    existing_user = db.query(User).filter(User.username == username).first()

    if not existing_user:
        print(f"Creating user: {username}")
        hashed_password = auth_service.get_password_hash("password123")
        new_user = User(
            username=username,
            full_name="Neural Analyst Demo",
            hashed_password=hashed_password,
            created_at=datetime.datetime.utcnow()
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"User created with ID: {new_user.id}")
    else:
        print(f"User {username} already exists. Updating password to password123.")
        existing_user.hashed_password = auth_service.get_password_hash("password123")
        db.commit()

    print("\n--- SQLite Seeding Complete ---")
    print(f"Login with: \nUsername: {username}\nPassword: password123")
    db.close()

if __name__ == "__main__":
    seed_sqlite()
