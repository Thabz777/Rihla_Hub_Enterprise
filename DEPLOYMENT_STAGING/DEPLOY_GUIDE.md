# Deployment Guide: Google Cloud Run + Cloudflare Pages

This folder contains the **Deployment-Ready** code.
We have isolated this from your core development files so you can experiment safely.

## Part 1: Backend Deployment (Google Cloud)
The Backend is the "Brain". Typically hosted on Google Cloud Run for stability.

1.  **Open Terminal** in the backend folder:
    ```bash
    cd backend
    ```
2.  **Deploy**:
    Run this command (requires Google Cloud CLI installed):
    ```bash
    gcloud run deploy rihla-backend --source . --port 5000 --allow-unauthenticated
    ```
    *(If asked to enable APIs or select a region, type `y` and choose a region like `europe-west1`).*

3.  **Get URL**:
    Google will provide a URL at the end (e.g., `https://rihla-backend-xyz.a.run.app`).  
    **Copy this URL.**

## Part 2: Frontend Deployment (Cloudflare)
The Frontend is the "Face". Hosted on Cloudflare Pages.

1.  **Configure URL**:
    Open the file `frontend/.env.production` in this deployment folder.
    Replace the placeholder with your **Google Cloud URL**:
    ```ini
    VITE_API_BASE_URL=https://rihla-backend-xyz.a.run.app
    ```

2.  **Build**:
    Open Terminal in the frontend folder:
    ```bash
    cd ../frontend
    npm install
    npm run build
    ```

3.  **Upload**:
    *   Log in to **Cloudflare Dashboard** -> **Pages**.
    *   Create a Project -> **Uppload Assets**.
    *   Upload the **`dist`** folder (created in the previous step).

## Summary
*   **Backend**: Running on Google.
*   **Frontend**: Running on Cloudflare.
*   **Database**: Currently In-Memory (Resets on restart).
    *   *To fix data loss later, we can connect Supabase.*
