# ✈️ SkyHaven — Modern Monolithic Flight Reservation System

> **SkyHaven** is an enterprise-grade flight search, seat reservation, and booking management platform built as a **high-performance modular monolith**. It consolidates authentication, flight schedules, visual seat maps, payments, in-process notifications, and an AI-driven natural language query assistant into a single unified Express application backed by a consolidated database schema and Redis caching.

---

## 🏛️ Monolith Architecture

```
                                  ┌──────────────────────────────────────────────────────────┐
                                  │         SkyHaven React + Vite Client (SPA)               │
                                  │   Tailwind CSS • Framer Motion • TanStack Query • Zustand│
                                  └────────────────────────────┬─────────────────────────────┘
                                                               │ REST API (JSON)
                                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   SkyHaven Monolithic Express Application                                   │
│                                                                                                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │   Auth Module    │  │  Flights Module  │  │  Booking & Pay   │  │   AI Assistant   │  │ Admin Module  │  │
│  │  - Users & Roles │  │  - Search & Hot  │  │  - Seat Lock Tx  │  │  - LLM parser    │  │  - Stats/KPIs │  │
│  │  - JWT & Bcrypt  │  │  - Airports/Map  │  │  - Sandbox Pay   │  │  - Rule engine   │  │  - Fleet CRUD │  │
│  │  - Rate Limiter  │  │  - Cabin/Seats   │  │  - Boarding Pass │  │  - Schema Map    │  │  - Bookings   │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  └───────┬───────┘  │
│           │                     │                     │                     │                     │          │
│           └─────────────────────┴──────────┬──────────┴─────────────────────┴─────────────────────┘          │
│                                            ▼                                                                 │
│                          ┌───────────────────────────────────┐                                               │
│                          │    In-Process Event Bus / Queue   │ ──► Notifications Module (Nodemailer)         │
│                          └─────────────────┬─────────────────┘                                               │
│                                            │                                                                 │
│                     ┌──────────────────────┴──────────────────────┐                                          │
│                     ▼                                             ▼                                          │
│       ┌────────────────────────────┐                ┌────────────────────────────┐                           │
│       │  Prisma / MySQL Database   │                │   Redis Cache & Sessions   │                           │
│       │  (Single Unified Schema)   │                │ (Search queries & tokens)  │                           │
│       └────────────────────────────┘                └────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 💡 Architectural Trade-Off: Why Monolith?

| Distributed Microservices (Previous) | Consolidated Modular Monolith (SkyHaven) |
| :--- | :--- |
| **5+ independent databases** causing distributed transaction headaches and dual-write inconsistencies. | **Single ACID database schema** using atomic transactions (`prisma.$transaction`) for guaranteed seat reservation. |
| **API Gateway & network overhead** adding 40–120ms per internal RPC hop. | **Zero internal network hops**; module boundaries call internal services with sub-millisecond in-process latency. |
| **RabbitMQ message broker operational burden** requiring separate clustering and DLQ management. | **Lightweight in-process EventEmitter / Redis queue** for asynchronous email and notification dispatch. |
| **Complex deployment pipelines** with multi-repo CI/CD orchestration. | **One-command containerization (`docker compose up`)** and straightforward horizontal scaling. |

---

## 🛠️ Technology Stack

- **Backend:** Node.js, Express, TypeScript, Prisma ORM, MySQL 8.0, Redis (with in-memory fallback), JWT auth, Bcrypt, Nodemailer, Zod validation, Helmet, Express Rate Limit.
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, TanStack Query, Zustand, Lucide React, Canvas Confetti.
- **AI Engine:** Dual-layer query parser — LLM provider abstraction (OpenAI / Gemini / Anthropic) with strict JSON schema parsing + resilient offline regex/NLP tokenizer fallback.
- **Testing:** Jest + Supertest for backend integration tests; Vitest for frontend components.

---

## 🚀 Quick Start Guide

### Option 1: One-Command Docker Compose (MySQL + Redis + Monolith)

```bash
docker compose up --build
```
- Monolith API: `http://localhost:5000`
- Frontend: `http://localhost:5173`
- MySQL 8.0: `localhost:3306`
- Redis: `localhost:6379`

---

### Option 2: Local Standalone Development

1. **Clone and Install Dependencies:**
   ```bash
   npm install
   ```

2. **Setup Database & Demo Seed Data:**
   ```bash
   npm run seed --workspace=backend
   ```

3. **Start Both Server & Client:**
   ```bash
   npm run dev
   ```
   - Frontend: `http://localhost:5173`
   - Monolith API: `http://localhost:5000/api/v1`
   - Healthcheck: `http://localhost:5000/health`

---

## 🔑 Demo Credentials

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@skyhaven.com` | `Admin@123` | Full admin analytics, flight schedule CRUD, live bookings inspection |
| **Customer** | `john.doe@example.com` | `Pass@123` | Flight search, visual seat selection, mock checkout, active itineraries |

*(The login page includes 1-click quick-fill buttons for both roles).*

---

## 🎯 Core User Flows

1. **AI-Powered Natural Language Search:**
   - Type queries like *"Cheapest flight to Goa next weekend under $100"* or *"Business class from Mumbai to London for 2 people"*.
   - Auto-extracts origin, destination, date, passengers, cabin class, and budget limits.
2. **Flight Search & Multi-Param Filtering:**
   - Filter by max budget slider, cabin class, preferred airlines, and departure timings.
   - Sort by price, flight duration, and takeoff time.
3. **Interactive 3D Aircraft Cabin Seat Map:**
   - Visual airplane fuselage with cockpit nose, aisle layout, emergency exit rows, and cabin classes (First, Business, Premium Economy, Economy).
   - Real-time seat locking with dynamic fare recalculation.
4. **Checkout & Mock Sandbox Payment:**
   - Traveler information form with passport/ID validation.
   - Sandbox payment simulator (Card with auto-formatter, UPI QR, NetBanking).
5. **Instant Electronic Boarding Pass:**
   - Airline boarding pass layout with QR barcode, airport IATA codes, flight timings, gate/terminal, and 1-click printable/PDF export.
   - Simulated transactional confirmation email dispatch via Nodemailer.
6. **My Bookings Dashboard:**
   - Active itineraries, past trip records, and 1-click cancellation with simulated refund processing.
7. **Administrator Control Center:**
   - Live telemetry KPIs (Gross Revenue, Load Factor %, Active Fleet, Total Bookings).
   - Flight schedule creator and fleet editor with automatic 120-seat cabin provisioning.
   - Real-time bookings inspector.

---

## 🧪 Testing

```bash
# Run all tests (backend + frontend)
npm run test

# Run backend API tests (Supertest + Jest)
npm run test --workspace=backend

# Run frontend tests (Vitest)
npm run test --workspace=frontend
```

---

## 📚 Documentation & Contributing

- 📡 [REST API Documentation](docs/API_DOCUMENTATION.md) — Comprehensive reference for all API endpoints, schemas, and payload examples.
- 🤝 [Contributing Guidelines](CONTRIBUTING.md) — Setup instructions, PR workflows, and conventional commit rules.
- 📜 [Code of Conduct](CODE_OF_CONDUCT.md) — Community pledge and standards.

---

## 📄 License
MIT License © 2026 SkyHaven Aviation Technologies.
