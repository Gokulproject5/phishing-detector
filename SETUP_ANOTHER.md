# 🚀 Setup Guide: Another Instance / New Environment

This guide explains how to set up the PhishGuard AI project for another developer, on another machine, or for another environment (like Production).

---

## 💻 1. Setup on Another Machine (Cloning)

If you are setting this up for the first time on a new computer:

1.  **Clone the Repository**:
    ```bash
    git clone <repository-url>
    cd phishing-bot
    ```

2.  **Prerequisites**:
    - Install **Python 3.10+**
    - Install **Node.js 18+**
    - Install **MongoDB** (optional, if using the NoSQL version)

---

## 🔑 2. Environment Variables (.env)

You need to create a `.env` file in the `backend/` directory. Copy the template below:

```bash
# backend/.env
SECRET_KEY=your-secure-secret-key
GEMINI_API_KEY=your-google-gemini-api-key

# For SQLite (default)
DATABASE_URL=sqlite:///./phishguard.db

# For MongoDB (optional)
MONGODB_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/phishguard
```

---

## 🗄️ 3. Setup Another Database

Depending on which database you want to use, run one of these "Setup Another" scripts:

### Option A: Local SQLite (Recommended for Dev)
This is the default setup used by the main API.
1. `cd backend`
2. `python seed_sqlite.py`

### Option B: MongoDB (Cloud/Remote)
If you want to use the MongoDB integration seen in `seed_db.py`:
1. Ensure `MONGODB_URL` is set in `.env`.
2. `cd backend`
3. `python seed_db.py`

### Option C: PostgreSQL (Production)
For production (e.g., on Render):
1. Create a PostgreSQL instance.
2. Set the `DATABASE_URL` to your postgres connection string.
3. The app will auto-initialize tables on startup.

---

## 👤 4. Setup Another User Account

To create another user for testing:

1. **Via Script**:
   Edit `backend/seed_sqlite.py` or `backend/seed_db.py`, change the `username` and `password` variables, and run it.
2. **Via API**:
   Use the registration endpoint while the server is running:
   ```bash
   POST /auth/register
   {
     "username": "newuser",
     "password": "newpassword123",
     "full_name": "New Analyst"
   }
   ```

---

## 🏃 5. Launch the Components

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Browser Extension
1. Open Chrome/Edge Extensions page (`chrome://extensions`).
2. Enable **Developer Mode**.
3. Click **Load Unpacked**.
4. Select the `browser-extension` folder.

---

*Need more help? Check the [FINAL_DOCUMENTATION.md](./FINAL_DOCUMENTATION.md) for architectural deep-dives.*
