# PhishGuard AI - Deployment Guide

This guide outlines the steps to deploy PhishGuard AI in a production environment.

## Frontend (React + Vite)

1.  **Environment Setup**:
    Create a `.env.production` file in the `frontend` directory:
    ```env
    VITE_API_URL=https://your-api-domain.com
    ```

2.  **Build**:
    Run the build command:
    ```bash
    cd frontend
    npm install
    npm run build
    ```
    This generates a `dist` folder.

3.  **Host**:
    Deploy the contents of the `dist` folder to a static hosting service (Netlify, Vercel, AWS S3/CloudFront).

## Backend (FastAPI)

1.  **Environment Setup**:
    Update the `backend/.env` file:
    ```env
    SECRET_KEY=generate-a-long-random-string
    GEMINI_API_KEY=your-actual-api-key
    ALLOWED_ORIGINS=https://your-frontend-domain.com
    ```

2.  **Database**:
    Initialize the database if needed:
    ```bash
    python seed_db_sqlite.py
    ```

3.  **Run in Production**:
    Use a production-ready server like `gunicorn` with `uvicorn` workers:
    ```bash
    pip install gunicorn
    gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
    ```

## Browser Extension

1.  Update the `API_BASE` in `browser-extension/popup.js` to your production API URL.
2.  Zip the `browser-extension` folder.
3.  Upload to the Chrome Web Store or distribute as a developer-mode extension.

## Database Setup (PostgreSQL Recommended)

For production, it is highly recommended to use a managed PostgreSQL database instead of the default SQLite.

1.  **Create a Database**: On Render, create a new **PostgreSQL** database.
2.  **Get Connection String**: Copy the **Internal Database URL** (for backend services on Render) or **External Database URL**.
3.  **Configue Backend**: Set the `DATABASE_URL` environment variable in your Backend Web Service to this connection string.

The app will automatically detect the production database and initialize the tables on startup.

---

## Render.com Deployment (Monorepo)

If you are deploying on **Render**, you must configure the **Root Directory** for each service:

### 1. Web Service (Backend)
- **Repo URL**: Your GitHub URL
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Port**: Render should automatically detect the port from the `$PORT` variable. If it fails, explicitly set the **Port** field in your Render service settings to `10000` (the Render default) or `8000` and ensure your environment variable matches.
- **Env Vars**: Add `SECRET_KEY`, `GEMINI_API_KEY`, and `ALLOWED_ORIGINS`.

### 2. Static Site (Frontend)
- **Repo URL**: Your GitHub URL
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Env Vars**: Add `VITE_API_URL` pointing to your backend service URL.

---

## Technical Cleanup Checklist
- [x] Hardcoded localhost URLs removed from frontend.
- [x] CORS restricted to authorized origins.
- [x] Sensitive keys moved to environment variables.
- [x] Unnecessary test/debug files removed.
