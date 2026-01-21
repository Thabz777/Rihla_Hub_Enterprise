# 🚀 Quick Deployment Checklist

Use this checklist to track your deployment progress.

## Pre-Deployment

- [ ] Code is tested and working locally
- [ ] All sensitive data removed from code
- [ ] `.gitignore` configured properly
- [ ] Environment variables documented

## Database Setup (MongoDB Atlas)

- [ ] MongoDB Atlas account created
- [ ] Free cluster created (M0)
- [ ] Database user created with password
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string copied and saved
- [ ] Test connection successful

## Code Repository

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Repository is public or accessible to deployment platforms
- [ ] `.env` files NOT committed

## Backend Deployment (Render)

- [ ] Render account created
- [ ] New Web Service created
- [ ] GitHub repository connected
- [ ] Root directory set to `backend`
- [ ] Build command: `pip install -r requirements.txt`
- [ ] Start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
- [ ] Environment variables added:
  - [ ] `MONGO_URL`
  - [ ] `DB_NAME`
  - [ ] `SECRET_KEY`
  - [ ] `CORS_ORIGINS`
- [ ] Deployment successful
- [ ] Backend URL saved: `_______________________________`
- [ ] API endpoint tested: `/api/brands`

## Frontend Deployment (Vercel)

- [ ] Vercel account created
- [ ] New project created
- [ ] GitHub repository connected
- [ ] Root directory set to `frontend`
- [ ] Framework preset: Create React App
- [ ] Build command: `npm run build`
- [ ] Output directory: `build`
- [ ] Environment variables added:
  - [ ] `REACT_APP_API_URL`
  - [ ] `REACT_APP_NAME`
  - [ ] `REACT_APP_VERSION`
- [ ] Deployment successful
- [ ] Frontend URL saved: `_______________________________`

## Post-Deployment Configuration

- [ ] CORS updated on backend with frontend URL
- [ ] Backend redeployed with new CORS settings
- [ ] Frontend can connect to backend
- [ ] No CORS errors in browser console

## Initial Setup

- [ ] Admin user created via registration
- [ ] Admin role set in MongoDB:
  - [ ] Logged into MongoDB Atlas
  - [ ] Navigated to `rihla_enterprise` → `users`
  - [ ] Found user document
  - [ ] Changed `"role": "user"` to `"role": "admin"`
  - [ ] Saved changes
- [ ] Logged in with admin account
- [ ] Dashboard loads correctly

## Testing

- [ ] **Authentication**:
  - [ ] Registration works
  - [ ] Login works
  - [ ] Logout works
  - [ ] Token persists on refresh
  
- [ ] **Dashboard**:
  - [ ] Metrics display correctly
  - [ ] Charts render properly
  - [ ] Brand filter works
  
- [ ] **Orders**:
  - [ ] Can view orders
  - [ ] Can create new order
  - [ ] Inventory updates after order
  - [ ] Customer created/updated
  
- [ ] **Products**:
  - [ ] Can view products
  - [ ] Can add new product
  - [ ] Can update stock
  
- [ ] **Customers**:
  - [ ] Can view customers
  - [ ] Can see order history
  - [ ] Invoice generation works
  
- [ ] **Team Management**:
  - [ ] Can view employees
  - [ ] Can add employee
  - [ ] Can update employee
  - [ ] Can delete employee

## Performance Check

- [ ] Frontend loads in < 3 seconds
- [ ] API responses < 500ms
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Works on different browsers:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge

## Security Verification

- [ ] HTTPS enabled (automatic on Vercel/Render)
- [ ] Environment variables not exposed
- [ ] API requires authentication
- [ ] CORS properly configured
- [ ] No sensitive data in frontend code

## Optional Enhancements

- [ ] Custom domain configured
- [ ] SSL certificate verified
- [ ] Analytics added (Google Analytics)
- [ ] Error tracking added (Sentry)
- [ ] Monitoring set up
- [ ] Backup strategy defined
- [ ] CI/CD pipeline configured

## Documentation

- [ ] Deployment URLs documented
- [ ] Admin credentials saved securely
- [ ] MongoDB credentials saved securely
- [ ] API documentation created
- [ ] User guide created

## Final Checks

- [ ] All features working as expected
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Ready for production use
- [ ] Team trained on platform usage

---

## Deployment Information

**Deployment Date**: _______________

**URLs**:
- Frontend: _______________________________________________
- Backend: _______________________________________________
- Database: MongoDB Atlas

**Credentials** (Store securely, not in this file!):
- Admin Email: _______________
- MongoDB User: _______________

**Notes**:
_________________________________________________________
_________________________________________________________
_________________________________________________________

---

## Troubleshooting Quick Reference

**Backend won't start**: Check Render logs and environment variables

**CORS errors**: Update `CORS_ORIGINS` on backend with exact frontend URL

**Database connection fails**: Verify MongoDB Atlas IP whitelist and credentials

**Frontend build fails**: Check build logs on Vercel, verify all dependencies

**API calls fail**: Check `REACT_APP_API_URL` is set correctly

---

**Need help?** Refer to:
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Detailed instructions
- [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) - Docker deployment
- [README.md](./README.md) - Project overview

---

**Congratulations on deploying Rihla Enterprise Cloud Platform! 🎉**
