# 🚀 Rihla Enterprise Cloud Platform - Deployment Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup (MongoDB Atlas)](#database-setup)
3. [Backend Deployment (Render)](#backend-deployment)
4. [Frontend Deployment (Vercel)](#frontend-deployment)
5. [Post-Deployment Configuration](#post-deployment)
6. [Alternative Deployment Options](#alternatives)
7. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

Before deploying, ensure you have:
- [ ] GitHub account
- [ ] Vercel account (free tier available)
- [ ] Render account (free tier available)
- [ ] MongoDB Atlas account (free tier available)
- [ ] Git installed on your local machine

---

## 🗄️ Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (Free tier M0 is sufficient)

### Step 2: Configure Database
1. **Create Database User**:
   - Go to Database Access
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username and password (save these!)
   - Grant "Read and write to any database" role

2. **Configure Network Access**:
   - Go to Network Access
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

3. **Get Connection String**:
   - Go to Database → Connect
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Save this connection string for later

**Example Connection String**:
```
mongodb+srv://rihla_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

## 🔧 Backend Deployment (Render)

### Step 1: Push Code to GitHub
```bash
# Navigate to your project directory
cd "D:\Antigravity Workspace\Rihla_Hub"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Rihla Enterprise Platform"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/rihla-hub.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `rihla-backend`
   - **Region**: Choose closest to your users (e.g., Frankfurt for Saudi Arabia)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`

5. **Add Environment Variables**:
   Click "Advanced" → "Add Environment Variable"
   
   | Key | Value |
   |-----|-------|
   | `MONGO_URL` | Your MongoDB connection string |
   | `DB_NAME` | `rihla_enterprise` |
   | `SECRET_KEY` | Generate a random string (use: `openssl rand -hex 32`) |
   | `CORS_ORIGINS` | `*` (will update after frontend deployment) |

6. Click "Create Web Service"
7. Wait for deployment to complete (5-10 minutes)
8. **Save your backend URL**: `https://rihla-backend.onrender.com`

### Step 3: Verify Backend
- Visit: `https://rihla-backend.onrender.com/api/brands`
- You should see a JSON response with brand data

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Update API URL
1. Open `frontend/.env.production`
2. Update `REACT_APP_API_URL` with your Render backend URL:
   ```
   REACT_APP_API_URL=https://rihla-backend.onrender.com/api
   ```

### Step 2: Update Frontend API Configuration
Check if your frontend has an API configuration file:

```bash
# Search for API configuration
cd frontend/src
# Look for files like: config.js, api.js, constants.js
```

If you find an API base URL hardcoded, update it to use environment variables:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
```

### Step 3: Commit Changes
```bash
git add .
git commit -m "Update API URL for production"
git push origin main
```

### Step 4: Deploy on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. **Add Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL` | `https://rihla-backend.onrender.com/api` |
   | `REACT_APP_NAME` | `Rihla Enterprise Cloud Platform` |
   | `REACT_APP_VERSION` | `1.0.0` |

6. Click "Deploy"
7. Wait for deployment (3-5 minutes)
8. **Save your frontend URL**: `https://rihla-hub.vercel.app`

---

## ⚙️ Post-Deployment Configuration

### Step 1: Update CORS Settings
1. Go back to Render dashboard
2. Open your backend service
3. Go to "Environment"
4. Update `CORS_ORIGINS` to your Vercel URL:
   ```
   https://rihla-hub.vercel.app
   ```
5. Save changes (service will auto-redeploy)

### Step 2: Create Admin User
1. Visit your frontend: `https://rihla-hub.vercel.app`
2. Click "Register" or "Sign Up"
3. Create your admin account
4. **Important**: You'll need to manually set this user as admin in MongoDB:
   - Go to MongoDB Atlas → Browse Collections
   - Find `rihla_enterprise` database → `users` collection
   - Find your user document
   - Edit the document and change `"role": "user"` to `"role": "admin"`
   - Save changes

### Step 3: Test the Platform
1. **Login**: Test authentication
2. **Dashboard**: Verify metrics load
3. **Create Order**: Test order creation
4. **Add Product**: Test product management
5. **View Customers**: Test customer data

---

## 🔄 Alternative Deployment Options

### Option A: Netlify (Frontend Alternative)
If you prefer Netlify over Vercel:
1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub repository
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`
5. Add environment variables
6. Deploy

### Option B: Railway (Backend Alternative)
If you prefer Railway over Render:
1. Go to [Railway](https://railway.app/)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables
5. Deploy

### Option C: Heroku (Full Stack)
Deploy both frontend and backend on Heroku:

**Backend**:
```bash
cd backend
heroku create rihla-backend
heroku config:set MONGO_URL="your-mongodb-url"
heroku config:set DB_NAME="rihla_enterprise"
heroku config:set SECRET_KEY="your-secret-key"
git push heroku main
```

**Frontend**: Use Heroku buildpack for create-react-app

### Option D: Docker + Cloud Platform
See `DOCKER_DEPLOYMENT.md` for containerized deployment

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Backend won't start
- **Solution**: Check Render logs for errors
- Verify all environment variables are set
- Ensure MongoDB connection string is correct

**Problem**: CORS errors
- **Solution**: Update `CORS_ORIGINS` to include your frontend URL
- Make sure there are no trailing slashes

**Problem**: Database connection fails
- **Solution**: 
  - Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
  - Check database user credentials
  - Ensure connection string format is correct

### Frontend Issues

**Problem**: API calls fail
- **Solution**: 
  - Check `REACT_APP_API_URL` is set correctly
  - Verify backend is running
  - Check browser console for CORS errors

**Problem**: Build fails on Vercel
- **Solution**:
  - Check build logs
  - Ensure all dependencies are in `package.json`
  - Try building locally: `npm run build`

**Problem**: Environment variables not working
- **Solution**:
  - Ensure variables start with `REACT_APP_`
  - Redeploy after adding variables
  - Clear build cache on Vercel

### General Issues

**Problem**: Slow initial load (Render free tier)
- **Solution**: Render free tier spins down after inactivity
- First request may take 30-60 seconds
- Consider upgrading to paid tier for production

**Problem**: Database quota exceeded
- **Solution**: MongoDB Atlas free tier has 512MB limit
- Monitor usage in Atlas dashboard
- Upgrade to paid tier if needed

---

## 📊 Monitoring & Maintenance

### Backend Monitoring (Render)
- View logs: Render Dashboard → Your Service → Logs
- Monitor metrics: CPU, Memory, Request count
- Set up alerts for downtime

### Frontend Monitoring (Vercel)
- View analytics: Vercel Dashboard → Your Project → Analytics
- Monitor build times and deployment status
- Check function logs if using serverless functions

### Database Monitoring (MongoDB Atlas)
- Monitor cluster metrics
- Set up alerts for high CPU/memory usage
- Review slow queries

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** to Git
2. **Use strong SECRET_KEY** (32+ characters, random)
3. **Rotate secrets regularly** (every 90 days)
4. **Enable 2FA** on all deployment platforms
5. **Monitor access logs** for suspicious activity
6. **Keep dependencies updated**: 
   ```bash
   # Backend
   pip list --outdated
   
   # Frontend
   npm outdated
   ```

---

## 🎉 Deployment Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Database user created with proper permissions
- [ ] Network access configured (0.0.0.0/0)
- [ ] Code pushed to GitHub
- [ ] Backend deployed on Render
- [ ] Backend environment variables set
- [ ] Backend URL verified and working
- [ ] Frontend environment variables updated
- [ ] Frontend deployed on Vercel
- [ ] CORS settings updated on backend
- [ ] Admin user created and role updated
- [ ] Platform tested end-to-end
- [ ] Custom domain configured (optional)
- [ ] SSL certificate verified (auto by Vercel/Render)
- [ ] Monitoring and alerts set up

---

## 🌐 Custom Domain Setup (Optional)

### For Frontend (Vercel)
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `platform.rihla.com`)
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

### For Backend (Render)
1. Go to Render Dashboard → Your Service → Settings → Custom Domains
2. Add your custom domain (e.g., `api.rihla.com`)
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

---

## 📞 Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **React Docs**: https://react.dev

---

## 🚀 Next Steps

After successful deployment:
1. Set up CI/CD for automatic deployments
2. Configure monitoring and error tracking (Sentry)
3. Set up automated backups for MongoDB
4. Implement rate limiting and security headers
5. Add analytics (Google Analytics, Mixpanel)
6. Set up email notifications
7. Create user documentation
8. Plan for scaling (upgrade tiers as needed)

---

**Congratulations! Your Rihla Enterprise Cloud Platform is now live! 🎊**

For questions or issues, please refer to the troubleshooting section or check the platform documentation.
