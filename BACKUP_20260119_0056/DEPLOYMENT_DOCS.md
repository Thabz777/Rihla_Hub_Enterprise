# Rihla Hub - Deployment Documentation
## Backup Date: 2026-01-19 00:59 (Saudi Arabia Time)

---

## 🌐 LIVE URLS

### Frontend (Cloudflare Pages)
- **Production URL:** https://rihla-hub.pages.dev
- **Custom Domain:** https://rihlahub.rihlatech.info
- **Public Invoice:** https://rihlahub.rihlatech.info/verify/{ORDER-NUMBER}

### Backend (Google Cloud Run)
- **Production URL:** https://rihla-backend-47485511620.us-west1.run.app
- **Region:** us-west1
- **Project ID:** thabzn8nn

---

## 🔐 LOGIN CREDENTIALS

| Role  | Email            | Password  |
|-------|------------------|-----------|
| Admin | admin@rihla.com  | admin123  |
| User  | user@rihla.com   | user123   |

---

## ☁️ GOOGLE CLOUD RUN CONFIGURATION

### Project Details
- **Project ID:** thabzn8nn
- **Service Name:** rihla-backend
- **Region:** us-west1
- **Authentication:** Allow unauthenticated

### Deployment Command
```bash
gcloud run deploy rihla-backend \
  --source . \
  --region us-west1 \
  --allow-unauthenticated
```

### Environment Variables (Optional)
```
PORT=5000
NODE_ENV=production
```

### How to Redeploy Backend
1. Open Google Cloud Console: https://console.cloud.google.com
2. Open Cloud Shell
3. Upload `Rihla_Backend_V5.zip`
4. Run:
   ```bash
   unzip Rihla_Backend_V5.zip -d rihla-backend
   cd rihla-backend
   gcloud run deploy rihla-backend --source . --region us-west1 --allow-unauthenticated
   ```

---

## 📄 CLOUDFLARE PAGES CONFIGURATION

### Project Details
- **Project Name:** rihla-hub
- **Production Branch:** main (Direct Upload)
- **Build Output:** / (Root - Flat Structure)

### Custom Domain
- **Domain:** rihlahub.rihlatech.info
- **DNS:** CNAME → rihla-hub.pages.dev

### How to Redeploy Frontend
1. Go to Cloudflare Dashboard: https://dash.cloudflare.com
2. Navigate to: Workers & Pages → rihla-hub
3. Click "Create deployment"
4. Select "Production"
5. Upload `Rihla_Frontend_V5_PUBLIC_QR.zip`
6. Click "Save and deploy"

### Important Settings
- **Framework preset:** None (Static HTML)
- **Build command:** (None - Pre-built)
- **Build output directory:** / (Root)

---

## 📁 PROJECT STRUCTURE

```
Rihla_Hub/
├── DEPLOYMENT_STAGING/
│   ├── frontend/           # React Frontend (Vite)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── context/
│   │   │   ├── pages/
│   │   │   └── App.jsx
│   │   ├── .env.production  # Backend URL config
│   │   ├── vite.config.js
│   │   └── package.json
│   │
│   └── backend/            # Node.js/Express Backend
│       ├── server.js       # Main API server
│       ├── package.json
│       └── Dockerfile
│
├── Rihla_Frontend_V5_PUBLIC_QR.zip  # Latest frontend build
└── Rihla_Backend_V5.zip             # Latest backend build
```

---

## 🔧 ENVIRONMENT VARIABLES

### Frontend (.env.production)
```
VITE_API_URL=https://rihla-backend-47485511620.us-west1.run.app
REACT_APP_BACKEND_URL=https://rihla-backend-47485511620.us-west1.run.app
```

### Backend
```
PORT=5000 (Cloud Run provides this automatically)
```

---

## 🚀 FEATURES IMPLEMENTED

### Authentication
- [x] Email/Password Login
- [x] 2-Factor Authentication (TOTP)
- [x] Admin Reset 2FA for users
- [x] Role-based access (Admin/User)

### Dashboard
- [x] Multi-brand KPI Cards
- [x] Revenue Trend Charts
- [x] Order Status Pie Chart
- [x] Recent Orders Table
- [x] Orders by User (Admin)

### Orders
- [x] Create New Orders
- [x] Order Status Management
- [x] VAT Calculation (15%)
- [x] Multi-currency Support

### Inventory
- [x] Product Management
- [x] Stock Tracking
- [x] Brand Filtering

### Customers
- [x] Customer List
- [x] Order History
- [x] Lifetime Value Calculation
- [x] Invoice Generation

### Employees
- [x] Employee Management
- [x] Department/Brand Assignment
- [x] Target Tracking
- [x] Performance Metrics

### Analytics (Admin)
- [x] User Performance Charts
- [x] Revenue Analytics

### Settings (Admin)
- [x] User Management
- [x] Create New Users
- [x] Reset Password
- [x] Manage Permissions
- [x] Reset 2FA

### Invoice
- [x] Professional Invoice Generation
- [x] QR Code for Public Verification
- [x] Print-friendly Layout
- [x] Public Invoice Page (/verify/:orderId)

---

## ⚠️ IMPORTANT NOTES

### Data Persistence
- Backend uses **IN-MEMORY storage**
- Data resets when Cloud Run container restarts
- Sample data is hardcoded in server.js
- For production: Migrate to PostgreSQL/Supabase

### Brands (Pre-configured)
| ID | Brand Name           | Color    |
|----|----------------------|----------|
| b1 | Rihla Technologies   | #3B82F6  |
| b2 | Rihla Brand Journey  | #10B981  |
| b3 | Rihla Abaya          | #8B5CF6  |
| b4 | Rihla Atelier        | #F59E0B  |

---

## 📞 SUPPORT

For any issues or questions, refer to this documentation.

Last Updated: 2026-01-19
