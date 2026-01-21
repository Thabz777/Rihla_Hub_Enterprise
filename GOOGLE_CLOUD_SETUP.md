# Google Cloud Run - Environment Variables Setup

## 🔧 Required Environment Variables

Set these environment variables in your Google Cloud Run service:

### Option 1: Google Cloud Console (Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **Cloud Run** → Select your service
3. Click **Edit & Deploy New Revision**
4. Scroll to **Container, Variables & Secrets, Connections, Security**
5. Click **Variables & Secrets** tab
6. Add the following environment variables:

| Name | Value |
|------|-------|
| `MONGO_URL` | `mongodb+srv://thabuos89_db_user:RihlaHub2026Secure!@cluster0.mongodb.net/?retryWrites=true&w=majority` |
| `DB_NAME` | `rihla_enterprise` |
| `JWT_SECRET` | `rihla-enterprise-super-secure-jwt-key-2026-thabz777-production-ready` |
| `JWT_EXPIRES_IN` | `7d` |
| `PORT` | `8080` |

7. Update the **Container** → **Command** to:
```
node server-mongodb.js
```

8. Click **Deploy**

---

### Option 2: Using gcloud CLI

```bash
gcloud run services update YOUR_SERVICE_NAME \
  --set-env-vars="MONGO_URL=mongodb+srv://thabuos89_db_user:RihlaHub2026Secure!@cluster0.mongodb.net/?retryWrites=true&w=majority" \
  --set-env-vars="DB_NAME=rihla_enterprise" \
  --set-env-vars="JWT_SECRET=rihla-enterprise-super-secure-jwt-key-2026-thabz777-production-ready" \
  --set-env-vars="JWT_EXPIRES_IN=7d" \
  --set-env-vars="PORT=8080" \
  --region=YOUR_REGION
```

---

## 📦 Dockerfile Update (if using Docker)

Make sure your Dockerfile runs the correct server file:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 8080

CMD ["node", "server-mongodb.js"]
```

---

## ✅ Verification Steps

After deploying, verify the setup:

1. **Health Check:**
```bash
curl https://YOUR_BACKEND_URL/api/health
```
Expected response:
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "database": "MongoDB Atlas",
  "timestamp": "2026-01-20T..."
}
```

2. **Test Login:**
- Go to your frontend URL
- Login with: `admin@rihla.com` / `admin123`
- Complete 2FA setup

3. **Test Public Invoice:**
```
https://YOUR_FRONTEND_URL/public/invoice/ORD-001
```

---

## 🔐 Security Recommendations

1. **Change Admin Password** after first login
2. **Use Secret Manager** for sensitive values in production:
   - `MONGO_URL`
   - `JWT_SECRET`

3. **Restrict MongoDB IP Access** to Cloud Run's egress IPs

---

## 📞 Support

If you encounter issues:
1. Check Cloud Run logs for errors
2. Verify MongoDB Atlas network access (0.0.0.0/0 for testing)
3. Ensure all environment variables are set correctly
