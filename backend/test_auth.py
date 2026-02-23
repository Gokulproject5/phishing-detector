from database import SessionLocal, User
from services.auth_service import AuthService

def test_auth():
    db = SessionLocal()
    auth = AuthService()
    
    username = "testuser"
    password = "password123"
    
    user = auth.get_user(db, username=username)
    if not user:
        print("User NOT found")
        return
        
    is_valid = auth.verify_password(password, user.hashed_password)
    print(f"Auth valid: {is_valid}")
    db.close()

if __name__ == "__main__":
    test_auth()
