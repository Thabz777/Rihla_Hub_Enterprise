# Rihla Enterprise Cloud Platform
## Project Documentation v1.0

---

# 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [System Architecture](#system-architecture)
4. [Technology Stack](#technology-stack)
5. [Core Modules](#core-modules)
6. [Database Schema](#database-schema)
7. [API Documentation](#api-documentation)
8. [User Roles & Permissions](#user-roles--permissions)
9. [Security Features](#security-features)
10. [Deployment Architecture](#deployment-architecture)

---

# Executive Summary

**Rihla Enterprise Cloud Platform** is a cloud-native, multi-brand enterprise management solution designed for Rihla's portfolio of businesses. The platform provides a unified command center for managing e-commerce operations, inventory, customers, employees, and financial analytics across all Rihla brands.

### Key Highlights
- **Multi-Brand Management**: Single dashboard to manage 4+ brands
- **Real-Time Analytics**: Live KPIs, charts, and performance metrics
- **Role-Based Access**: Admin and User roles with granular permissions
- **2-Factor Authentication**: Enhanced security with TOTP-based 2FA
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Saudi Arabia Compliant**: 15% VAT calculation, SAR currency default

---

# Project Overview

## Vision
To create a unified, scalable, and secure enterprise platform that empowers Rihla's teams to manage all business operations from a single, intuitive interface.

## Objectives
1. Centralize multi-brand operations management
2. Provide real-time visibility into business performance
3. Streamline order and inventory management
4. Enable data-driven decision making through analytics
5. Ensure security with modern authentication
6. Support Saudi Arabian business requirements (VAT, currency)

## Brands Managed
| Brand | Industry | Color Code |
|-------|----------|------------|
| Rihla Technologies | Software/Cloud Services | #3B82F6 (Blue) |
| Rihla Brand Journey | Marketing/Branding | #10B981 (Green) |
| Rihla Abaya | Fashion/Clothing | #8B5CF6 (Purple) |
| Rihla Atelier | Luxury/Couture | #F59E0B (Amber) |

---

# System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USERS                                     │
│                    (Web Browsers)                                │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              CLOUDFLARE PAGES (Frontend)                         │
│              https://rihlahub.rihlatech.info                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  React SPA (Vite Build)                                  │    │
│  │  - Components                                            │    │
│  │  - Pages                                                 │    │
│  │  - Context (Auth, Theme)                                 │    │
│  │  - Tailwind CSS                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTPS API Calls
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              GOOGLE CLOUD RUN (Backend)                          │
│              https://rihla-backend-*.us-west1.run.app            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Node.js + Express API                                   │    │
│  │  - Authentication (/api/auth/*)                          │    │
│  │  - Dashboard (/api/dashboard/*)                          │    │
│  │  - Orders (/api/orders/*)                                │    │
│  │  - Products (/api/products/*)                            │    │
│  │  - Customers (/api/customers/*)                          │    │
│  │  - Employees (/api/employees/*)                          │    │
│  │  - Users (/api/users/*)                                  │    │
│  │  - Public Invoice (/api/public/*)                        │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              DATA STORAGE (In-Memory)                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  USERS | BRANDS | PRODUCTS | CUSTOMERS | ORDERS | EMP.  │    │
│  │                                                          │    │
│  │  Note: For production, migrate to PostgreSQL/Supabase    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

# Technology Stack

## Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI Framework | 18.x |
| Vite | Build Tool | 5.x |
| React Router | Navigation | 6.x |
| Tailwind CSS | Styling | 3.x |
| Recharts | Charts/Graphs | 2.x |
| Lucide React | Icons | Latest |
| Axios | HTTP Client | 1.x |
| Sonner | Toast Notifications | Latest |
| Shadcn/UI | Component Library | Latest |

## Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| Node.js | Runtime | 20.x |
| Express.js | Web Framework | 4.x |
| CORS | Cross-Origin Support | Latest |
| dotenv | Environment Variables | Latest |

## Infrastructure
| Service | Purpose | Provider |
|---------|---------|----------|
| Frontend Hosting | Static Site Hosting | Cloudflare Pages |
| Backend Hosting | Serverless Containers | Google Cloud Run |
| DNS | Domain Management | Cloudflare |
| Custom Domain | rihlahub.rihlatech.info | Cloudflare |

---

# Core Modules

## 1. Dashboard
- **Purpose**: Central command center overview
- **Features**:
  - KPI Cards (Revenue, Orders, Customers, Products)
  - Revenue Trend Chart (30 days)
  - Order Status Pie Chart
  - Recent Orders Table
  - Orders by User (Admin only)
- **Access**: All authenticated users

## 2. Orders Management
- **Purpose**: Create and manage customer orders
- **Features**:
  - Create new orders with multiple items
  - Customer selection or creation
  - Automatic VAT calculation (15%)
  - Status management (Pending → Processing → Completed)
  - Brand filtering
- **Access**: All authenticated users

## 3. Inventory Management
- **Purpose**: Product and stock management
- **Features**:
  - Product CRUD operations
  - Stock level tracking
  - Brand assignment
  - Category management
  - Price management (SAR)
- **Access**: All authenticated users

## 4. Customer Management
- **Purpose**: Customer relationship tracking
- **Features**:
  - Customer list with order history
  - Lifetime Value (LTV) calculation
  - Recent orders per customer
  - Invoice generation
- **Access**: All authenticated users

## 5. Employee Management
- **Purpose**: HR and performance tracking
- **Features**:
  - Employee CRUD operations
  - Department/Brand assignment
  - Salary and bonus tracking
  - Target setting and achievement tracking
  - Annual target reset
- **Access**: Admin only

## 6. Analytics
- **Purpose**: Business intelligence and reporting
- **Features**:
  - User performance metrics
  - Revenue analytics
  - Order trends
- **Access**: Admin only

## 7. Settings
- **Purpose**: User and system administration
- **Features**:
  - User management (CRUD)
  - Password reset
  - Permission management
  - 2FA reset
  - Theme toggle (Dark/Light)
- **Access**: Admin only (User management)

## 8. Invoice System
- **Purpose**: Invoice generation and verification
- **Features**:
  - Professional invoice layout
  - QR code for verification
  - Public verification page
  - Print-friendly design
- **Access**: Authenticated (generation), Public (verification)

---

# Database Schema

## Users
```javascript
{
  id: Number,
  email: String,
  password: String,  // Note: Hash in production
  full_name: String,
  role: 'admin' | 'user',
  two_factor_secret: String | null,
  employee_id: String | null,
  permissions: {
    dashboard: Boolean,
    orders: Boolean,
    inventory: Boolean,
    customers: Boolean,
    analytics: Boolean,
    settings: Boolean,
    can_create: Boolean,
    can_edit: Boolean,
    can_delete: Boolean
  }
}
```

## Brands
```javascript
{
  id: String,
  name: String,
  logo: String,
  color: String  // Hex code
}
```

## Products
```javascript
{
  id: String,
  sku: String,
  name: String,
  brand_id: String,
  brand_name: String,
  price: Number,
  stock: Number,
  currency: String,
  category: String
}
```

## Customers
```javascript
{
  id: String,
  name: String,
  email: String,
  phone: String,
  created_at: ISO Date String
}
```

## Orders
```javascript
{
  id: String,
  order_number: String,
  customer_name: String,
  customer_email: String,
  customer_id: String,
  brand_id: String,
  brand_name: String,
  items: [{
    product_id: String,
    product_name: String,
    quantity: Number,
    price: Number
  }],
  total: Number,
  vat_amount: Number,
  currency: String,
  status: 'pending' | 'processing' | 'completed' | 'cancelled',
  created_at: ISO Date String,
  payment_method: String,
  created_by_user_id: Number,
  attributed_employee_id: String
}
```

## Employees
```javascript
{
  id: String,
  name: String,
  email: String,
  phone: String,
  position: String,
  department: String,
  brand_id: String,
  brand_name: String,
  salary: Number,
  bonus: Number,
  target: Number,
  achieved: Number,
  status: 'active' | 'inactive',
  last_reset_year: Number
}
```

---

# API Documentation

## Authentication Endpoints

### POST /api/auth/login
Login with email and password.
- **Body**: `{ email, password }`
- **Response**: `{ access_token, user }` or `{ status: 'setup_2fa', qr_code }` or `{ status: '2fa_required' }`

### POST /api/auth/verify-2fa
Verify 2FA code.
- **Body**: `{ email, token, temp_secret? }`
- **Response**: `{ access_token, user }`

### GET /api/auth/me
Get current user info.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: User object

## Dashboard Endpoints

### GET /api/dashboard/metrics
Get KPI metrics.
- **Query**: `?brand_id=`
- **Response**: `{ total_revenue, revenue_change, total_orders, orders_change, total_customers, total_products }`

### GET /api/dashboard/revenue-trend
Get revenue trend data.
- **Query**: `?brand_id=&month=&year=`
- **Response**: `[{ date, revenue }]`

## Orders Endpoints

### GET /api/orders
List all orders.
- **Query**: `?brand_id=&status=`

### POST /api/orders
Create new order.
- **Body**: Order object

### PUT /api/orders/:id
Update order status.
- **Query**: `?status=`

## Products Endpoints

### GET /api/products
List products.
- **Query**: `?brand_id=`

### POST /api/products
Create product.

### PUT /api/products/:id
Update product.

## Customers Endpoints

### GET /api/customers/with-orders
List customers with order stats.

## Employees Endpoints

### GET /api/employees
List employees.
- **Query**: `?brand_id=&department=&status=`

### GET /api/employees/stats
Get employee statistics.

### POST /api/employees
Create employee.

### PUT /api/employees/:id
Update employee.

### DELETE /api/employees/:id
Delete employee.

## Users Endpoints (Admin)

### GET /api/users
List all users.

### POST /api/users
Create new user.

### PUT /api/users/:email/reset-password
Reset user password.
- **Query**: `?new_password=`

### PUT /api/users/:email/permissions
Update user permissions.
- **Body**: Permissions object

### PUT /api/users/:email/reset-2fa
Reset user's 2FA.

## Public Endpoints

### GET /api/public/invoice/:customerId
Get customer statement (public).

### GET /api/public/invoice-by-order/:orderId
Get single order invoice (public).

---

# User Roles & Permissions

## Admin Role
- Full access to all modules
- Can create/edit/delete users
- Can reset passwords and 2FA
- Can manage permissions
- Can view analytics
- Can manage employees

## User Role
- Access to Dashboard
- Access to Orders (create only)
- Access to Inventory (view only)
- Access to Customers (view + invoice)
- No access to Analytics
- No access to Settings (user management)
- No access to Employees

---

# Security Features

## Authentication
1. **Email/Password**: Standard credential verification
2. **2-Factor Authentication**: TOTP-based (Google Authenticator, Microsoft Authenticator compatible)
3. **JWT Tokens**: Bearer token authentication for API calls

## Authorization
1. **Role-Based Access Control (RBAC)**: Admin/User roles
2. **Permission System**: Granular permissions per user
3. **Route Protection**: Frontend route guards

## Data Protection
1. **HTTPS**: All traffic encrypted
2. **CORS**: Configured for allowed origins
3. **Input Validation**: Server-side validation

---

# Deployment Architecture

## Frontend (Cloudflare Pages)
```
┌─────────────────────────────────────┐
│         Cloudflare Pages            │
├─────────────────────────────────────┤
│  Project: rihla-hub                 │
│  URL: rihla-hub.pages.dev           │
│  Custom: rihlahub.rihlatech.info    │
│                                     │
│  Build: Pre-built (Vite)            │
│  Output: / (root)                   │
│  Files: index.html, index.js, css   │
└─────────────────────────────────────┘
```

## Backend (Google Cloud Run)
```
┌─────────────────────────────────────┐
│         Google Cloud Run            │
├─────────────────────────────────────┤
│  Project: thabzn8nn                 │
│  Service: rihla-backend             │
│  Region: us-west1                   │
│                                     │
│  Runtime: Node.js 20                │
│  Port: 5000                         │
│  Auth: Unauthenticated allowed      │
│  Memory: Auto-scaled                │
└─────────────────────────────────────┘
```

---

# Future Roadmap

## Phase 2: Database Migration
- [ ] Migrate to PostgreSQL/Supabase
- [ ] Implement data persistence
- [ ] Add data backup/restore

## Phase 3: Additional Features
- [ ] Email notifications
- [ ] SMS integration
- [ ] Payment gateway integration
- [ ] Shipping/logistics module
- [ ] Advanced reporting

## Phase 4: Mobile App
- [ ] React Native mobile app
- [ ] Push notifications
- [ ] Offline capability

---

**Document Version**: 1.0
**Last Updated**: 2026-01-19
**Author**: Rihla Technologies Development Team
