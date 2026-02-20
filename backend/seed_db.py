import asyncio
import os
from datetime import datetime
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import certifi
from passlib.context import CryptContext

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_db():
    # Attempt with simplified URI options
    base_url = os.getenv("MONGODB_URL").split('?')[0]
    # Rebuild URL with explicit flags that might help on Python 3.14
    url = f"{base_url}?retryWrites=true&w=majority&tls=true&tlsAllowInvalidCertificates=true"
    
    print(f"Connecting to MongoDB with URI: {url}")
    
    client = AsyncIOMotorClient(
        url, 
        serverSelectionTimeoutMS=5000,
        tlsCAFile=certifi.where()
    )
    
    db = client.phishguard
    
    try:
        print("Pinging MongoDB...")
        await client.admin.command('ping')
        print("MongoDB connection successful!")
        
        # 1. Create Test User
        username = "testuser"
        existing_user = await db.users.find_one({"username": username})
        
        if not existing_user:
            print(f"Creating user: {username}")
            hashed_password = pwd_context.hash("password123")
            new_user = {
                "username": username,
                "full_name": "Test Security Analyst",
                "hashed_password": hashed_password,
                "created_at": datetime.utcnow()
            }
            result = await db.users.insert_one(new_user)
            user_id = str(result.inserted_id)
            print(f"User created with ID: {user_id}")
        else:
            print(f"User {username} already exists.")
            user_id = str(existing_user["_id"])

        # 2. Add Dummy Scan History
        print("Adding dummy scan history...")
        dummy_scans = [
            {
                "user_id": user_id,
                "url": "http://secure-bank-login.com/verify",
                "result": {"prediction": "Phishing", "probability": 0.98},
                "timestamp": datetime.utcnow()
            },
            {
                "user_id": user_id,
                "url": "https://google.com",
                "result": {"prediction": "Legitimate", "probability": 0.01},
                "timestamp": datetime.utcnow()
            }
        ]
        
        await db.scans.insert_many(dummy_scans)
        print("Dummy scans added successfully!")
        print("\n--- Seeding Complete ---")
        print(f"Login with: \nUsername: {username}\nPassword: password123")
        
    except Exception as e:
        print(f"Seeding failed: {e}")

if __name__ == "__main__":
    asyncio.run(seed_db())
