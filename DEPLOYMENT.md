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

## Cleanup Checklist
- [x] Hardcoded localhost URLs removed from frontend.
- [x] CORS restricted to authorized origins.
- [x] Sensitive keys moved to environment variables.
- [x] Unnecessary test/debug files removed.
