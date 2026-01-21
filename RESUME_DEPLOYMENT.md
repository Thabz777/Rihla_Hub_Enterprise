# 🚀 Resume Deployment: Production Launch

We have successfully updated the backend to use Node.js with MongoDB and prepared the frontend for Cloudflare Pages.

Here are the exact commands to complete the deployment to **Google Cloud Run** and **Cloudflare Pages**.

---

## 🏗️ Part 1: Backend (Google Cloud Run)

The Dockerfile has been fixed to use Node.js 18.

### 1. Authenticate & Config
```bash
# Login to Google Cloud
gcloud auth login

# Set project ID (Replace with your actual Project ID)
gcloud config set project YOUR_PROJECT_ID
```

### 2. Build & Submit Container
```bash
cd "d:\Antigravity Workspace\Rihla_Hub\backend"

# Submit build to Google Cloud Build
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/rihla-backend
```

### 3. Deploy to Cloud Run
```bash
# Deploy the container
gcloud run deploy rihla-backend \
  --image gcr.io/YOUR_PROJECT_ID/rihla-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="MONGO_URL=your_mongodb_connection_string,NODE_ENV=production,CORS_ORIGINS=https://your-frontend-domain.pages.dev"
```

> **Note**: Replace `your_mongodb_connection_string` with your actual Atlas connection string.

---

## 🎨 Part 2: Frontend (Cloudflare Pages)

The `_redirects` file is ready for SPA routing.

### 1. Update API URL
Before building, ensure the frontend points to your new Cloud Run URL.

Open `frontend/.env.production` (or create it) and add:
```env
REACT_APP_BACKEND_URL=https://rihla-backend-xyz.a.run.app
```
*(Replace with your actual Cloud Run URL from Part 1)*

### 2. Build the Project
```bash
cd "d:\Antigravity Workspace\Rihla_Hub\frontend"
npm install
npm run build
```

### 3. Deploy to Cloudflare
```bash
# Login to Cloudflare
npx wrangler login

# Deploy the 'build' folder
npx wrangler pages deploy build --project-name rihla-hub
```

---

## ✅ Post-Deployment Checks

1. **Verify Backend**: Visit `https://your-backend-url/api/health` -> Should return `{"status": "healthy"}`.
2. **Verify Frontend**: Visit your Cloudflare URL -> Should load the Login page.
3. **Test Public Invoice**: 
   - Create an order.
   - Scan the QR code or visit `https://your-frontend-url/public/invoice/ORDER_ID`.

🚀 **You are ready to go live!**
