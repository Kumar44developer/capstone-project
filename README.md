<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

# 🎓 CampusDev — Capstone Project

> **A full-stack platform that connects businesses with college-verified student developers, featuring a comprehensive India Geographic Data REST API with tiered authentication, B2B dashboards, and admin analytics.**

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Authentication](#-authentication)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [Frontend](#-frontend)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**CampusDev** is a two-part capstone project:

1. **Landing Page** (`index.html`) — A polished, responsive marketing page for the CampusDev marketplace, where businesses hire verified student developers for freelance web, app, and AI projects at startup-friendly rates.

2. **India Geographic Data API** (`src/` + `frontend/`) — A production-grade REST API serving India's complete administrative hierarchy (States → Districts → Sub-Districts → Villages) with:
   - JWT-based user authentication
   - API key/secret credential system with hashed storage
   - Tiered rate limiting (Free / Premium / Pro / Unlimited)
   - B2B usage analytics and quota management
   - Admin dashboard with platform-wide analytics
   - React-based interactive demo portal

---

## 🚀 Live Demo

| Component | URL |
|-----------|-----|
| Landing Page | Open `index.html` in any browser |
| API Server | `http://localhost:5000` (after setup) |
| Health Check | `GET http://localhost:5000/health` |

---

## ✨ Features

### 🏠 Landing Page
- **Responsive Design** — Mobile-first layout with CSS Grid and Flexbox
- **Sticky Header** — Frosted-glass navbar with smooth scroll navigation
- **Pure CSS Hamburger Menu** — Animated toggle with no JavaScript
- **SVG Illustrations** — Custom vector art for hero section and trust badge
- **Accessibility** — ARIA labels, focus-visible outlines, reduced-motion support
- **Inter Typography** — Google Fonts with optimized loading

### 🗺️ Geographic Data API
- **Hierarchical Browsing** — Navigate State → District → Sub-District → Village
- **Village Search** — Case-insensitive search with full hierarchy in results
- **Village Hierarchy** — Get complete administrative path for any village
- **Statistics Endpoint** — Aggregate counts across all geographic levels
- **Pagination** — Configurable page size (max 100) for village listings

### 🔐 Authentication & Security
- **User Registration & Login** — Email/password with bcrypt hashing
- **JWT Tokens** — 7-day expiry, bearer token authorization
- **API Key Generation** — Unique `sk_` keys + `secret_` secrets, bcrypt-hashed at rest
- **Tiered Rate Limits** — Free: 1K/day, Premium: 100K/day, Pro: 1M/day, Unlimited: 999M/day
- **Global Rate Limiting** — 100 requests/hour on public endpoints
- **Expiration & Quota Checks** — Middleware enforces daily limits with auto-reset
- **API Request Logging** — Every B2B request logged with response time and bytes transferred

### 📊 B2B & Admin
- **B2B Profile** — View account details, active API keys, and quotas
- **Usage Analytics** — Historical usage breakdown by endpoint, day, status, and method
- **Quota Dashboard** — Real-time remaining requests and percentage used
- **Admin Analytics** — Platform-wide user stats, tier distribution, top endpoints, response times
- **User Management** — Admin can update user tiers and view API logs
- **Data Integrity Checks** — Detect orphaned village records

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Landing Page** | HTML5, CSS3 (CSS Variables, Grid, Flexbox), SVG |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL via Prisma ORM |
| **Auth** | JSON Web Tokens (JWT), bcryptjs |
| **Rate Limiting** | express-rate-limit |
| **Frontend** | React 18, Vite, Axios |
| **API Style** | RESTful JSON |

---

## 📁 Project Structure

```
capstone-project/
│
├── index.html                        
│
├── src/                              
│   ├── server.js                    
│   ├── auth.js                       
│   ├── v1.js                        
│   ├── b2b.js                       
│   ├── routes                       
│   └── middleware/
│       ├── authJwt.js              
│       ├── authApiKey.js            
│       └── adminAuth.js             
│
├── frontend/                        
│   ├── main.jsx                     
│   ├── App.css                       
│   ├── index.css                   
│   ├── src/
│   │   ├── App.jsx                   
│   │   ├── pages/
│   │   │   └── DemoPortal.jsx       
│   │   └── services/
│   │       └── api.js               
│   ├── styles/
│   │   └── DemoPortal.css           
│   └── dist/                         
│       ├── index.html
│       └── assets/
│
└── README.md                       
```

---

## 🏁 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **PostgreSQL** ≥ 14.x (running instance with a database created)

### 1. Clone the Repository

```bash
git clone https://github.com/Kumar44developer/capstone-project.git
cd capstone-project
```

### 2. Install Backend Dependencies

```bash
npm install
```

> **Required packages:** `express`, `cors`, `dotenv`, `@prisma/client`, `express-rate-limit`, `bcryptjs`, `jsonwebtoken`

### 3. Configure Environment

Create a `.env` file in the project root:

```env
# Server
API_PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/campusdev?schema=public"

# Auth
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

### 4. Set Up the Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed geographic data
npx prisma db seed
```

### 5. Start the Backend

```bash
# Development
node src/server.js

# You should see:
# 🚀 Server running on http://localhost:5000
# 📡 Environment: development
# 📊 Database: Connected
```

### 6. Start the Frontend (Optional)

```bash
cd frontend
npm install
npm run dev
```

The React demo portal will be available at `http://localhost:5173`.

---

## 📡 API Documentation

### Base URL

```
http://localhost:5000
```

### Public Endpoints (`/api/v1`) — Rate limited: 100 req/hour

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/states` | List all states (sorted alphabetically) |
| `GET` | `/api/v1/states/:stateId/districts` | List districts in a state |
| `GET` | `/api/v1/districts/:districtId/subdistricts` | List sub-districts in a district |
| `GET` | `/api/v1/subdistricts/:subDistrictId/villages` | List villages (paginated) |
| `GET` | `/api/v1/villages/search?q=:query` | Search villages by name (min 2 chars) |
| `GET` | `/api/v1/villages/:villageId/hierarchy` | Get full hierarchy for a village |
| `GET` | `/api/v1/stats` | Get aggregate counts |

### Auth Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register a new user | None |
| `POST` | `/api/auth/login` | Login and get JWT token | None |
| `POST` | `/api/auth/generate-api-key` | Generate API key + secret | JWT |

### B2B Endpoints (`/api/b2b`) — Requires API Key + Secret

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/b2b/profile` | Get user profile and active keys |
| `GET` | `/api/b2b/usage?days=30` | Usage analytics (max 90 days) |
| `GET` | `/api/b2b/quotas` | Current quota status |

### Admin Endpoints (`/api/admin`) — Requires JWT + Admin Tier

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/users` | List all users with counts |
| `PATCH` | `/api/admin/users/:userId/tier` | Update user tier |
| `GET` | `/api/admin/analytics` | Platform-wide analytics |
| `GET` | `/api/admin/data-stats` | Geographic data statistics |
| `GET` | `/api/admin/api-logs?limit=50&status=200` | View API request logs |

### Example Requests

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@example.com","name":"Dev User","password":"secure123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@example.com","password":"secure123"}'

# Get all states
curl http://localhost:5000/api/v1/states

# Search villages
curl "http://localhost:5000/api/v1/villages/search?q=Mumbai&limit=10"

# Generate API key (requires JWT)
curl -X POST http://localhost:5000/api/auth/generate-api-key \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# B2B request (requires API key)
curl http://localhost:5000/api/b2b/profile \
  -H "x-api-key: sk_your_key" \
  -H "x-api-secret: secret_your_secret"
```

### Response Format

All endpoints return consistent JSON:

```json
{
  "success": true,
  "count": 36,
  "data": [ ... ]
}
```

Error responses:

```json
{
  "error": "Error type",
  "message": "Human-readable description"
}
```

---

## 🔐 Authentication

The API uses a **two-layer authentication** system:

```
┌─────────────────────────────────────────────────────┐
│                   Authentication Flow                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Public Endpoints (/api/v1)                         │
│  └── No auth required, rate-limited (100 req/hr)    │
│                                                     │
│  Auth Endpoints (/api/auth)                         │
│  ├── Register → Creates user (free tier)            │
│  ├── Login → Returns JWT token (7-day expiry)       │
│  └── Generate API Key → Requires JWT                │
│      └── Returns sk_ key + secret_ (show once!)     │
│                                                     │
│  B2B Endpoints (/api/b2b)                           │
│  └── Requires x-api-key + x-api-secret headers     │
│      └── Daily limits enforced per tier             │
│                                                     │
│  Admin Endpoints (/api/admin)                       │
│  └── Requires JWT + user.tier === 'admin'           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Tier Limits

| Tier | Daily API Requests |
|------|--------------------|
| `free` | 1,000 |
| `premium` | 100,000 |
| `pro` | 1,000,000 |
| `unlimited` | 999,999,999 |

---

## ⚙️ Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `API_PORT` | No | `5000` | Server port |
| `NODE_ENV` | No | — | `development` or `production` |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string |
| `JWT_SECRET` | **Yes** | — | Secret key for signing JWT tokens |

---

## 🗄️ Database Schema

The project uses **Prisma ORM** with the following models:

```
┌──────────┐     ┌───────────┐     ┌──────────────┐     ┌──────────┐
│  State   │────▸│ District  │────▸│ SubDistrict  │────▸│ Village  │
│          │ 1:N │           │ 1:N │              │ 1:N │          │
│ id       │     │ id        │     │ id           │     │ id       │
│ stateCode│     │ distCode  │     │ subDistCode  │     │ villCode │
│ stateName│     │ distName  │     │ subDistName  │     │ villName │
└──────────┘     └───────────┘     └──────────────┘     └──────────┘

┌──────────┐     ┌───────────┐     ┌──────────────┐
│  User    │────▸│  ApiKey   │     │   ApiLog     │
│          │ 1:N │           │     │              │
│ id       │     │ id        │     │ id           │
│ email    │     │ keyHash   │     │ userId       │
│ name     │     │ secretHash│     │ endpoint     │
│ passHash │     │ dailyLimit│     │ method       │
│ tier     │     │ reqToday  │     │ status       │
│ isActive │     │ lastUsed  │     │ responseTime │
│ createdAt│     │ expiresAt │     │ bytesXferred │
└──────────┘     └───────────┘     └──────────────┘
```

---

## 💻 Frontend

The React frontend (`frontend/`) provides an interactive **Demo Portal** for exploring the geographic data API:

- **Stats Dashboard** — Displays total counts of states, districts, sub-districts, and villages
- **Quick Search** — Search for villages with instant results showing full hierarchy
- **Hierarchical Browser** — Cascading dropdowns (State → District → Sub-District → Village)
- **Village Details** — Complete hierarchy display with formatted address and copy-to-clipboard
- **API Quick Start** — Code examples for developers

### Frontend Tech

- **React 18** with functional components and hooks
- **Vite** for fast development and bundling
- **Axios** with request/response interceptors for auth
- **Configurable API URL** via `VITE_API_URL` env variable

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## 📄 License

This project is part of a capstone submission. All rights reserved.

---

## 👤 Author

**Kumar44developer**

- GitHub: [@Kumar44developer](https://github.com/Kumar44developer)

---

<p align="center">
  <strong>Built with ❤️ as a Capstone Project</strong>
</p>
