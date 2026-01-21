# Rihla Hub - High Level Network Design
## Enterprise Cloud Platform Architecture

---

# 📋 Document Information

| Field | Value |
|-------|-------|
| Document Title | High Level Network Design |
| Version | 1.0 |
| Date | 2026-01-19 |
| Classification | Internal |
| Author | Rihla Technologies |

---

# 🎯 Overview

This document describes the high-level network design (HLD) for the Rihla Enterprise Cloud Platform. The platform uses a modern serverless architecture leveraging Cloudflare's global CDN network for frontend delivery and Google Cloud Run for backend API services.

---

# 🌐 Network Architecture Diagram

```
                                    ┌─────────────────────────────────────────────────────────────────┐
                                    │                         INTERNET                                 │
                                    └─────────────────────────────┬───────────────────────────────────┘
                                                                  │
                                                                  │ HTTPS (443)
                                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                           CLOUDFLARE EDGE NETWORK                                                    │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                                                               │  │
│  │   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                   │  │
│  │   │   Edge PoP      │    │   Edge PoP      │    │   Edge PoP      │    │   Edge PoP      │    ...            │  │
│  │   │   (Riyadh)      │    │   (Dubai)       │    │   (Frankfurt)   │    │   (London)      │                   │  │
│  │   └────────┬────────┘    └────────┬────────┘    └────────┬────────┘    └────────┬────────┘                   │  │
│  │            │                      │                      │                      │                             │  │
│  │            └──────────────────────┴──────────────────────┴──────────────────────┘                             │  │
│  │                                              │                                                                 │  │
│  │                                              ▼                                                                 │  │
│  │                              ┌───────────────────────────────────┐                                            │  │
│  │                              │         CLOUDFLARE DNS            │                                            │  │
│  │                              │   rihlahub.rihlatech.info         │                                            │  │
│  │                              │   CNAME → rihla-hub.pages.dev     │                                            │  │
│  │                              └───────────────────────────────────┘                                            │  │
│  │                                                                                                               │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┬───────────────────────────────────────────────┘
                                                                      │
                              ┌───────────────────────────────────────┴───────────────────────────────────────┐
                              │                                                                               │
                              ▼                                                                               ▼
┌─────────────────────────────────────────────────────────────┐   ┌─────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE PAGES                          │   │                    GOOGLE CLOUD PLATFORM                     │
│                                                              │   │                                                              │
│  ┌────────────────────────────────────────────────────────┐ │   │  ┌────────────────────────────────────────────────────────┐ │
│  │                                                        │ │   │  │                                                        │ │
│  │              FRONTEND APPLICATION                      │ │   │  │              CLOUD RUN SERVICE                         │ │
│  │                                                        │ │   │  │                                                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │   │  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │                                                  │ │ │   │  │  │                                                  │ │ │
│  │  │   Static Assets (CDN Cached)                    │ │ │   │  │  │   rihla-backend (Container)                      │ │ │
│  │  │                                                  │ │ │   │  │  │                                                  │ │ │
│  │  │   • index.html                                  │ │ │   │  │  │   • Node.js 20 Runtime                           │ │ │
│  │  │   • index.js (React Bundle)                     │ │ │   │  │  │   • Express.js Server                            │ │ │
│  │  │   • index.css (Tailwind)                        │ │ │   │  │  │   • Port 5000                                    │ │ │
│  │  │   • Assets (fonts, images)                      │ │ │   │  │  │   • Auto-scaling (0-100 instances)               │ │ │
│  │  │                                                  │ │ │   │  │  │                                                  │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │   │  │  └──────────────────────────────────────────────────┘ │ │
│  │                                                        │ │   │  │                                                        │ │
│  │  URL: https://rihla-hub.pages.dev                      │ │   │  │  URL: https://rihla-backend-*.us-west1.run.app        │ │
│  │  Custom: https://rihlahub.rihlatech.info               │ │   │  │  Region: us-west1                                      │ │
│  │                                                        │ │   │  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │   │  └────────────────────────────────────────────────────────┘ │
│                                                              │   │                                                              │
└──────────────────────────────────────────────────────────────┘   └──────────────────────────────────────────────────────────────┘
```

---

# 🔗 Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                              USER REQUEST FLOW                                                    │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

     USER                    CLOUDFLARE                  CLOUDFLARE PAGES              GOOGLE CLOUD RUN
      │                          │                              │                              │
      │   1. Opens URL           │                              │                              │
      │   rihlahub.rihlatech.info│                              │                              │
      │─────────────────────────>│                              │                              │
      │                          │                              │                              │
      │                          │   2. DNS Resolution          │                              │
      │                          │   CNAME lookup               │                              │
      │                          │─────────────────────────────>│                              │
      │                          │                              │                              │
      │                          │   3. Serve Static Files      │                              │
      │                          │<─────────────────────────────│                              │
      │                          │   (HTML, JS, CSS from CDN)   │                              │
      │                          │                              │                              │
      │   4. Return Static App   │                              │                              │
      │<─────────────────────────│                              │                              │
      │                          │                              │                              │
      │   5. React App Loads     │                              │                              │
      │   User Interacts         │                              │                              │
      │   (e.g., Login)          │                              │                              │
      │                          │                              │                              │
      │   6. API Request         │                              │                              │
      │   POST /api/auth/login   │                              │                              │
      │──────────────────────────────────────────────────────────────────────────────────────>│
      │                          │                              │                              │
      │                          │                              │                              │   7. Process Request
      │                          │                              │                              │   Validate Credentials
      │                          │                              │                              │   Generate Token
      │                          │                              │                              │
      │   8. API Response        │                              │                              │
      │   { access_token, user } │                              │                              │
      │<──────────────────────────────────────────────────────────────────────────────────────│
      │                          │                              │                              │
      │   9. Subsequent API Calls│                              │                              │
      │   (with Bearer Token)    │                              │                              │
      │──────────────────────────────────────────────────────────────────────────────────────>│
      │                          │                              │                              │
```

---

# 🏗️ Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                           APPLICATION LAYERS                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (Cloudflare Pages)                                                                          │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                                                           │  │
│  │   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                │  │
│  │   │   Login     │   │  Dashboard  │   │   Orders    │   │  Inventory  │   │  Customers  │                │  │
│  │   │   Page      │   │    Page     │   │    Page     │   │    Page     │   │    Page     │                │  │
│  │   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘                │  │
│  │                                                                                                           │  │
│  │   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                │  │
│  │   │  Employees  │   │  Analytics  │   │  Settings   │   │   Invoice   │   │   Public    │                │  │
│  │   │    Page     │   │    Page     │   │    Page     │   │    Page     │   │   Invoice   │                │  │
│  │   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘                │  │
│  │                                                                                                           │  │
│  │   ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐    │  │
│  │   │                              SHARED COMPONENTS                                                   │    │  │
│  │   │   Sidebar  │  Header  │  Layout  │  KPICard  │  ChartContainer  │  UI Components (46)          │    │  │
│  │   └─────────────────────────────────────────────────────────────────────────────────────────────────┘    │  │
│  │                                                                                                           │  │
│  │   ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐    │  │
│  │   │                              CONTEXT PROVIDERS                                                   │    │  │
│  │   │                         AuthContext  │  ThemeContext                                             │    │  │
│  │   └─────────────────────────────────────────────────────────────────────────────────────────────────┘    │  │
│  │                                                                                                           │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                      │
                                                      │ HTTPS API Calls
                                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  API LAYER (Google Cloud Run)                                                                                    │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                                                           │  │
│  │   ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐    │  │
│  │   │                              EXPRESS.JS APPLICATION                                              │    │  │
│  │   │                                                                                                  │    │  │
│  │   │   ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐            │    │  │
│  │   │   │   Auth     │   │ Dashboard  │   │   Orders   │   │  Products  │   │ Customers  │            │    │  │
│  │   │   │  Routes    │   │   Routes   │   │   Routes   │   │   Routes   │   │   Routes   │            │    │  │
│  │   │   └────────────┘   └────────────┘   └────────────┘   └────────────┘   └────────────┘            │    │  │
│  │   │                                                                                                  │    │  │
│  │   │   ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐                             │    │  │
│  │   │   │ Employees  │   │   Users    │   │  Analytics │   │   Public   │                             │    │  │
│  │   │   │   Routes   │   │   Routes   │   │   Routes   │   │   Routes   │                             │    │  │
│  │   │   └────────────┘   └────────────┘   └────────────┘   └────────────┘                             │    │  │
│  │   │                                                                                                  │    │  │
│  │   └─────────────────────────────────────────────────────────────────────────────────────────────────┘    │  │
│  │                                                                                                           │  │
│  │   ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐    │  │
│  │   │                              MIDDLEWARE                                                          │    │  │
│  │   │                         CORS  │  JSON Parser  │  Auth Validator                                  │    │  │
│  │   └─────────────────────────────────────────────────────────────────────────────────────────────────┘    │  │
│  │                                                                                                           │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                      │
                                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  DATA LAYER (In-Memory - Future: PostgreSQL)                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                                                           │  │
│  │   ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐    │  │
│  │   │   USERS    │   │   BRANDS   │   │  PRODUCTS  │   │ CUSTOMERS  │   │   ORDERS   │   │ EMPLOYEES  │    │  │
│  │   │            │   │            │   │            │   │            │   │            │   │            │    │  │
│  │   │ id, email  │   │ id, name   │   │ id, sku    │   │ id, name   │   │ id, number │   │ id, name   │    │  │
│  │   │ password   │   │ color      │   │ name       │   │ email      │   │ customer   │   │ position   │    │  │
│  │   │ role       │   │ logo       │   │ price      │   │ phone      │   │ items[]    │   │ salary     │    │  │
│  │   │ 2fa_secret │   │            │   │ stock      │   │ orders[]   │   │ total      │   │ target     │    │  │
│  │   │ permissions│   │            │   │ brand_id   │   │            │   │ status     │   │ achieved   │    │  │
│  │   └────────────┘   └────────────┘   └────────────┘   └────────────┘   └────────────┘   └────────────┘    │  │
│  │                                                                                                           │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# 🔒 Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                           SECURITY LAYERS                                                        │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  LAYER 1: EDGE SECURITY (Cloudflare)                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  • DDoS Protection (Automatic)                                         │  │
│  │  • SSL/TLS Encryption (TLS 1.3)                                        │  │
│  │  • WAF (Web Application Firewall)                                      │  │
│  │  • Bot Protection                                                      │  │
│  │  • Rate Limiting                                                       │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  LAYER 2: TRANSPORT SECURITY                                                 │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  • HTTPS Only (No HTTP)                                                │  │
│  │  • Certificate: Let's Encrypt / Cloudflare                             │  │
│  │  • HSTS Enabled                                                        │  │
│  │  • Strong Cipher Suites                                                │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  LAYER 3: APPLICATION SECURITY                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  • CORS Configuration (Allowed Origins)                                │  │
│  │  • JWT Token Authentication                                            │  │
│  │  • 2-Factor Authentication (TOTP)                                      │  │
│  │  • Role-Based Access Control (RBAC)                                    │  │
│  │  • Permission-Based Authorization                                      │  │
│  │  • Input Validation                                                    │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  LAYER 4: INFRASTRUCTURE SECURITY (Google Cloud)                             │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  • IAM (Identity and Access Management)                                │  │
│  │  • VPC Service Controls (Future)                                       │  │
│  │  • Audit Logging                                                       │  │
│  │  • Automatic Security Patches                                          │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

# 🌍 Geographic Distribution

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                           GLOBAL DEPLOYMENT                                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌─────────────────────────────┐
                                    │     CLOUDFLARE NETWORK      │
                                    │     (300+ Edge Locations)   │
                                    └─────────────────────────────┘
                                              │
           ┌──────────────────────────────────┼──────────────────────────────────┐
           │                                  │                                  │
           ▼                                  ▼                                  ▼
    ┌─────────────┐                    ┌─────────────┐                    ┌─────────────┐
    │   MIDDLE    │                    │   EUROPE    │                    │    ASIA     │
    │    EAST     │                    │             │                    │   PACIFIC   │
    │             │                    │             │                    │             │
    │ • Riyadh    │                    │ • Frankfurt │                    │ • Singapore │
    │ • Dubai     │                    │ • London    │                    │ • Tokyo     │
    │ • Jeddah    │                    │ • Amsterdam │                    │ • Sydney    │
    │ • Bahrain   │                    │ • Paris     │                    │ • Mumbai    │
    └─────────────┘                    └─────────────┘                    └─────────────┘

                                              │
                                              │ Origin Requests
                                              ▼
                                    ┌─────────────────────────────┐
                                    │   GOOGLE CLOUD PLATFORM     │
                                    │                             │
                                    │   Region: us-west1          │
                                    │   (The Dalles, Oregon)      │
                                    │                             │
                                    │   ┌───────────────────────┐ │
                                    │   │    Cloud Run          │ │
                                    │   │    rihla-backend      │ │
                                    │   │    Auto-scaling       │ │
                                    │   └───────────────────────┘ │
                                    └─────────────────────────────┘

                    ┌─────────────────────────────────────────────────────────────┐
                    │                    LATENCY OPTIMIZATION                      │
                    ├─────────────────────────────────────────────────────────────┤
                    │  • Static assets cached at edge (< 50ms globally)           │
                    │  • API requests routed to nearest Cloudflare PoP            │
                    │  • Single backend region (acceptable for current scale)     │
                    │  • Future: Multi-region backend for lower latency           │
                    └─────────────────────────────────────────────────────────────┘
```

---

# 📊 Network Specifications

## Bandwidth & Performance

| Metric | Specification |
|--------|---------------|
| Frontend CDN | Cloudflare (Unlimited Bandwidth) |
| Backend | Google Cloud Run (Auto-scaled) |
| Max Frontend Size | ~1 MB (gzipped: ~280 KB) |
| Typical API Response | < 10 KB |
| Expected Latency (ME) | < 100ms |
| Max Concurrent Users | Unlimited (auto-scale) |

## Ports & Protocols

| Service | Protocol | Port | Description |
|---------|----------|------|-------------|
| Frontend | HTTPS | 443 | Cloudflare Pages |
| Backend API | HTTPS | 443 | Cloud Run (internal: 5000) |
| DNS | UDP/TCP | 53 | Cloudflare DNS |

## Domain Configuration

| Domain | Type | Target |
|--------|------|--------|
| rihlahub.rihlatech.info | CNAME | rihla-hub.pages.dev |
| rihlatech.info | NS | Cloudflare DNS |

---

# 🔄 Failover & Redundancy

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              REDUNDANCY ARCHITECTURE                                     │
└─────────────────────────────────────────────────────────────────────────────────────────┘

                        ┌─────────────────────────────────┐
                        │      CLOUDFLARE EDGE            │
                        │   (Anycast - Global Redundancy) │
                        │                                 │
                        │  • Auto-failover between PoPs   │
                        │  • 100% Uptime SLA              │
                        │  • DDoS Mitigation              │
                        └─────────────────────────────────┘
                                        │
                                        ▼
                        ┌─────────────────────────────────┐
                        │      CLOUDFLARE PAGES           │
                        │                                 │
                        │  • Static content replicated    │
                        │  • Automatic CDN caching        │
                        │  • No single point of failure   │
                        └─────────────────────────────────┘
                                        │
                                        ▼
                        ┌─────────────────────────────────┐
                        │      GOOGLE CLOUD RUN           │
                        │                                 │
                        │  • Auto-scaling (0-100+)        │
                        │  • Health checks                │
                        │  • Automatic restarts           │
                        │  • Multi-zone within region     │
                        │                                 │
                        │  Current: Single Region (us-w1) │
                        │  Future: Multi-region           │
                        └─────────────────────────────────┘
```

---

# 📈 Scaling Strategy

## Current Architecture (Phase 1)
- **Frontend**: Cloudflare Pages (Infinite scale)
- **Backend**: Cloud Run (Auto-scale 0-100 instances)
- **Database**: In-Memory (Single instance)

## Future Architecture (Phase 2)
- **Backend**: Multi-region Cloud Run
- **Database**: Cloud SQL (PostgreSQL) with replicas
- **Caching**: Redis/Memorystore

## Scaling Triggers

| Component | Trigger | Action |
|-----------|---------|--------|
| Cloud Run | CPU > 70% | Scale up instances |
| Cloud Run | CPU < 20% | Scale down instances |
| Cloud Run | Request latency > 500ms | Scale up |

---

# 📝 Summary

The Rihla Hub platform uses a modern, serverless architecture with:

1. **Cloudflare** for global CDN, DNS, and edge security
2. **Google Cloud Run** for scalable, containerized backend
3. **HTTPS everywhere** for secure communications
4. **JWT + 2FA** for authentication
5. **Auto-scaling** for handling variable load
6. **Global distribution** for low latency access

This architecture provides enterprise-grade reliability, security, and performance while maintaining cost-efficiency through serverless scaling.

---

**Document Version**: 1.0
**Last Updated**: 2026-01-19
**Author**: Rihla Technologies
