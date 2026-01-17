# Rihla Enterprise Cloud Platform

> **Multi-Brand E-Commerce & Operations Management System**

A comprehensive, cloud-native enterprise platform designed to manage e-commerce, digital marketing, CRM, logistics, finance, analytics, and remote teams across all Rihla brands.

![Platform Status](https://img.shields.io/badge/status-ready%20to%20deploy-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110.1-009688?logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)

## 🌟 Features

### Core Capabilities
- **Multi-Brand E-Commerce Command Center** - Unified dashboard for all Rihla brands
- **E-Commerce Operations & Inventory** - Real-time inventory management
- **Digital Marketing & Social Commerce** - Integrated marketing tools
- **CRM & Customer Management** - Complete customer lifecycle management
- **Shipping, Fulfillment & Returns** - End-to-end logistics management
- **Financial & Accounting Management** - Saudi-compliant financial tracking
- **Remote Team & Project Collaboration** - Team management and collaboration
- **Analytics & Business Intelligence** - Real-time insights and reporting
- **Supplier & Vendor Management** - Supply chain optimization
- **Automation & Cloud Architecture** - Scalable cloud infrastructure

### Brands Supported
- 🧕 **Rihla Abaya** - Elegant modest fashion
- 💎 **Rihla Atelier** - Luxury jewelry & fashion
- 💻 **Rihla Technologies** - Digital services & solutions
- 🎯 **Rihla Brand Journey** - Consulting & branding

## 🚀 Quick Start

### Local Development

**Prerequisites**:
- Node.js 18+ and npm/yarn
- Python 3.11+
- MongoDB (local or Atlas)

**Frontend**:
```bash
cd frontend
npm install
npm start
# Opens on http://localhost:3000
```

**Backend**:
```bash
cd backend
pip install -r requirements.txt
# Create .env file (see .env.example)
uvicorn server:app --reload
# Runs on http://localhost:8000
```

### Docker (Recommended for Testing)

```bash
# Run entire stack with one command
docker-compose up -d

# Access:
# - Frontend: http://localhost
# - Backend: http://localhost:8000
# - MongoDB: localhost:27017
```

## 📦 Deployment

### Production Deployment (Recommended)

We recommend deploying with:
- **Frontend**: Vercel (free tier available)
- **Backend**: Render (free tier available)
- **Database**: MongoDB Atlas (free tier available)

**Step-by-step guide**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

**Quick Deploy**:
1. Set up MongoDB Atlas cluster
2. Deploy backend to Render
3. Deploy frontend to Vercel
4. Configure environment variables
5. Update CORS settings

Total time: ~30 minutes

### Alternative Deployment Options

- **Docker**: See [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
- **AWS/Azure/GCP**: Cloud platform deployment guides
- **Heroku**: Full-stack deployment
- **Railway**: Alternative to Render
- **Netlify**: Alternative to Vercel

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │Dashboard │  │ Orders   │  │Inventory │  │Analytics│ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                    REST API (HTTPS)
                           │
┌─────────────────────────────────────────────────────────┐
│                   Backend (FastAPI)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │   Auth   │  │   API    │  │Business  │  │  Data   │ │
│  │  Layer   │  │ Routes   │  │  Logic   │  │ Models  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                    MongoDB Driver
                           │
┌─────────────────────────────────────────────────────────┐
│                 Database (MongoDB)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Users   │  │  Orders  │  │ Products │  │Customers│ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.0.0
- **Routing**: React Router DOM 7.5.1
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS 3.4.17
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts 3.6.0
- **HTTP Client**: Axios 1.8.4

### Backend
- **Framework**: FastAPI 0.110.1
- **Database**: MongoDB (Motor async driver)
- **Authentication**: JWT (PyJWT 2.10.1)
- **Password Hashing**: Passlib + bcrypt
- **Validation**: Pydantic 2.12.5
- **CORS**: Starlette Middleware

### Infrastructure
- **Hosting**: Vercel (Frontend) + Render (Backend)
- **Database**: MongoDB Atlas
- **CDN**: Vercel Edge Network
- **SSL**: Automatic (Let's Encrypt)

## 📁 Project Structure

```
Rihla_Hub/
├── frontend/                 # React application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── lib/             # Utilities and helpers
│   │   └── App.js           # Main app component
│   ├── package.json
│   └── Dockerfile
│
├── backend/                  # FastAPI application
│   ├── server.py            # Main application file
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Environment variables template
│   ├── Dockerfile
│   └── render.yaml          # Render deployment config
│
├── docker-compose.yml        # Docker orchestration
├── vercel.json              # Vercel deployment config
├── DEPLOYMENT_GUIDE.md      # Detailed deployment instructions
├── DOCKER_DEPLOYMENT.md     # Docker deployment guide
└── README.md                # This file
```

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ CORS protection
- ✅ Input validation with Pydantic
- ✅ SQL injection prevention (NoSQL)
- ✅ XSS protection
- ✅ HTTPS enforcement
- ✅ Environment variable management
- ✅ Role-based access control (RBAC)

## 📊 Key Features in Detail

### Dashboard
- Real-time metrics across all brands
- Revenue trends and analytics
- Order status tracking
- Inventory alerts
- Customer insights

### Order Management
- Multi-brand order creation
- Automatic VAT calculation (Saudi 15%)
- Inventory deduction
- Customer tracking
- Invoice generation

### Inventory Management
- Real-time stock tracking
- Low stock alerts
- Multi-brand product catalog
- SKU management
- Category organization

### Customer Management
- Customer profiles
- Order history
- Lifetime value tracking
- Invoice generation
- Contact management

### Team Management
- Employee profiles
- Department organization
- Salary and bonus tracking
- Performance metrics
- Target achievement

## 🌍 Localization

- **Primary Language**: English
- **Secondary Language**: Arabic (brand names)
- **Currency**: SAR (Saudi Riyal)
- **VAT**: 15% (Saudi Arabia compliant)
- **Timezone**: UTC with local conversion

## 📈 Performance

- **Frontend Load Time**: < 2s
- **API Response Time**: < 200ms
- **Database Queries**: Optimized with indexes
- **Caching**: Browser caching + CDN
- **Bundle Size**: Optimized with code splitting

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
pytest

# E2E tests (if configured)
npm run test:e2e
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Environment Variables

### Backend (.env)
```env
MONGO_URL=mongodb+srv://...
DB_NAME=rihla_enterprise
SECRET_KEY=your-secret-key
CORS_ORIGINS=https://your-frontend.vercel.app
```

### Frontend (.env.production)
```env
REACT_APP_API_URL=https://your-backend.onrender.com/api
REACT_APP_NAME=Rihla Enterprise Cloud Platform
REACT_APP_VERSION=1.0.0
```

## 🐛 Known Issues & Roadmap

### Current Limitations
- Free tier services may have cold start delays
- MongoDB Atlas free tier: 512MB storage limit
- Render free tier: Spins down after 15 minutes of inactivity

### Roadmap
- [ ] Email notifications
- [ ] SMS integration
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Payment gateway integration
- [ ] Automated reporting
- [ ] AI-powered insights

## 📞 Support

- **Documentation**: See deployment guides
- **Issues**: GitHub Issues
- **Email**: support@rihla.com (example)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Designed for Saudi Arabian market compliance
- Optimized for multi-brand enterprise operations

---

**Made with ❤️ for Rihla Enterprise**

**Ready to deploy?** → [Start with the Deployment Guide](./DEPLOYMENT_GUIDE.md)

**Prefer Docker?** → [Check the Docker Guide](./DOCKER_DEPLOYMENT.md)
