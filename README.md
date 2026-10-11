# SkyHaven — Enterprise Flight Reservation System

SkyHaven is a full-stack, modular monolithic flight reservation and scheduling platform built with TypeScript, Node.js, Express, React, Prisma ORM, and MySQL. It integrates real-time seat inventory management, distributed concurrency locks, round-trip itinerary processing, payment processing via Stripe, and natural language query extraction powered by large language models.

---

## Architectural Overview

SkyHaven is designed as a modular monolith to maximize development velocity, maintain strong consistency guarantees, and avoid the operational overhead of microservices.

```
                                  +----------------------------------------------------------+
                                  |         SkyHaven Client Application (React + Vite)       |
                                  |   Tailwind CSS | Framer Motion | TanStack Query | Zustand|
                                  +----------------------------+-----------------------------+
                                                               | HTTP / JSON REST
                                                               v
+-------------------------------------------------------------------------------------------------------------+
|                                        SkyHaven Monolithic Backend                                          |
|                                                                                                             |
|  +------------------+  +------------------+  +------------------+  +------------------+  +---------------+  |
|  |   Auth Module    |  |  Flights Module  |  |  Booking & Pay   |  |   AI Assistant   |  | Admin Module  |  |
|  |  - JWT & RBAC    |  |  - Dynamic Query |  |  - Seat Hold Tx  |  |  - LLM Parsers   |  |  - KPI Telemetry|
|  |  - Password Hash |  |  - Schedule Mgmt |  |  - Atomic Bookings|  |  - Offline Regex |  |  - Fleet Admin |  |
|  |  - Rate Limiting |  |  - Fare Engine   |  |  - Stripe Engine |  |  - Structured Out|  |  - Reservations|  |
|  +--------+---------+  +--------+---------+  +--------+---------+  +--------+---------+  +-------+-------+  |
|           |                     |                     |                     |                     |          |
|           +---------------------+----------+----------+---------------------+---------------------+          |
|                                            |                                                                 |
|                                            v                                                                 |
|                          +-----------------------------------+                                               |
|                          |    In-Process Event Bus / Queue   | ----> Notifications Service (Nodemailer)      |
|                          +-----------------+-----------------+                                               |
|                                            |                                                                 |
|                     +----------------------+----------------------+                                          |
|                     v                                             v                                          |
|       +----------------------------+                +----------------------------+                           |
|       |     MySQL 8.0 Database     |                |   Redis In-Memory Engine   |                           |
|       |  (ACID Schema via Prisma)  |                | (Seat holds & query cache) |                           |
|       +----------------------------+                +----------------------------+                           |
+-------------------------------------------------------------------------------------------------------------+
```

### Architectural Decisions

* **ACID Transactions over Sagas:** Flight seat inventory and passenger reservations execute within atomic database transactions (`prisma.$transaction`). This eliminates distributed dual-write inconsistencies and booking collisions without requiring complex distributed consensus protocols.
* **Distributed Concurrency via Redis:** To prevent double-booking during checkout, seats are temporarily held using Redis key leases with a strict 5-minute time-to-live (TTL). If a customer completes payment, the hold converts to an atomic database booking; if abandoned or expired, the key automatically expires and the seats become immediately available.
* **Low-Latency In-Process Dispatch:** Inter-module communication executes directly in-memory, avoiding serialisation and network latency between service boundaries. Asynchronous tasks such as transactional confirmation emails run on an in-process event emitter.

---

## Engineering Features

### 1. Distributed Seat Locking and Concurrency Control
* High-contention seat reservations implement optimistic checks backed by Redis key-level leases (`seat_hold:<flightId>:<seatId>`).
* Real-time seat hold verification protects against race conditions when concurrent users attempt to select the same aircraft seat simultaneously.
* Background listeners and countdown timers handle automatic lease expirations and seat releases.

### 2. Multi-Leg Round-Trip Reservation Engine
* Supports multi-leg flight discovery: outbound leg selection dynamically advances to return leg selection with synchronized route and date constraints.
* Seat map visualizer supports contextual dual-leg seat selection with cabin-class pricing modifiers across both flight legs.
* Unified atomic checkout commits passenger data, seat allocations, and payment verification for both flights within a single transactional boundary.

### 3. Natural Language Travel Query Engine
* Translates unstructured search prompts (e.g., *"Direct flight from Mumbai to Delhi next Friday under 6000 for 2 adults"*) into strict JSON query parameters.
* Implements a multi-provider strategy supporting Groq (`llama3-70b-8192`), Google Gemini (`gemini-1.5-flash`), and OpenAI (`gpt-4o-mini`).
* Features an offline heuristic NLP parser as a resilient fallback when external API quotas are unavailable or rate-limited.

### 4. Stripe Payment Integration
* Integrates Stripe PaymentIntents with client-side Stripe Elements.
* Strict server-side verification ensures the payment amount matches the computed reservation total down to the cent prior to committing tickets to the database.

### 5. Role-Based Access Control and Security
* JWT-based authentication with HTTP-only tokens, bcrypt password hashing (10 salt rounds), and role enforcement (`CUSTOMER`, `ADMIN`).
* Protected admin dashboards provide operational KPIs (Gross Revenue, Load Factor, Active Fleet, Reservation Volumes) and fleet management capabilities.
* API security enforced via Helmet header hardening, CORS policies, and IP-based rate limiting.

---

## Technology Stack

### Backend
* **Runtime & Framework:** Node.js (v20+), Express.js (v4)
* **Language:** TypeScript (v5)
* **Database & ORM:** MySQL 8.0, Prisma ORM (v6)
* **Caching & Distributed Locks:** Redis, ioredis (v5)
* **Payments:** Stripe Node SDK (v22)
* **Validation & Security:** Zod (v3), Helmet (v8), Express Rate Limit (v7), Bcrypt.js (v3), JsonWebToken (v9)
* **Testing:** Jest, Supertest, ts-jest

### Frontend
* **Build Tool & Framework:** Vite (v6), React (v18), TypeScript
* **State Management:** Zustand (v5) with session-isolated storage
* **Styling & Design System:** Tailwind CSS (v3), Framer Motion (v12), Lucide Icons
* **Data Fetching:** TanStack React Query (v5)
* **Testing:** Vitest (v3), React Testing Library

---

## Project Structure

```
SkyHaven/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # Declarative MySQL schema
│   │   └── seed.ts               # Database seeder with realistic aviation fleet
│   ├── src/
│   │   ├── config/               # Database, Redis, Mailer, and Environment configuration
│   │   ├── middleware/           # Auth, error handling, rate limiting, and request validation
│   │   ├── modules/
│   │   │   ├── ai/               # Multi-provider LLM parser and heuristic NLP fallback
│   │   │   ├── auth/             # Registration, login, profile, and JWT issuance
│   │   │   ├── bookings/         # Seat locking, Stripe payments, and reservation transactions
│   │   │   ├── feedback/         # Customer feedback endpoints and analytics
│   │   │   ├── flights/          # Flight query engine, airports, and fleet schedule CRUD
│   │   │   └── notifications/    # Transactional email dispatcher with HTML templates
│   │   ├── utils/                # Geodesic distance calculation and system telemetry
│   │   ├── app.ts                # Express application configuration
│   │   └── server.ts             # Server entry point and graceful shutdown handlers
│   └── tests/                    # Integration and unit test suites
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/            # Fleet management, bookings table, and feedback review
│   │   │   ├── booking/          # Interactive seat map, passenger forms, and boarding passes
│   │   │   ├── flights/          # Search filters, flight cards, and sort controls
│   │   │   ├── home/             # Hero search, flight deals, and destination explorer
│   │   │   ├── layout/           # Adaptive glassmorphism navbar and layout wrappers
│   │   │   └── ui/               # Reusable design system primitives (Modal, Button, Tabs, Card)
│   │   ├── context/              # Authentication and Theme providers
│   │   ├── pages/                # Routed views (Search, Details, Checkout, Dashboard, Auth)
│   │   ├── services/             # Axios/Fetch API client layer
│   │   ├── store/                # Zustand stores with session persistence
│   │   └── types/                # Domain models and API response types
│   └── vite.config.ts            # Vite build configuration
├── docker-compose.yml            # Multi-service container orchestration
└── package.json                  # Root monorepo workspace configuration
```

---

## Getting Started

### Prerequisites
* **Node.js:** v20.x or higher
* **npm:** v10.x or higher
* **MySQL:** v8.0 or higher running on `localhost:3306`

### Installation and Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Prithviraj-Dhavan/SkyHaven.git
   cd SkyHaven
   ```

2. **Install all workspace dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   DATABASE_URL="mysql://root:password@localhost:3306/skyhaven"
   JWT_SECRET="your_secure_jwt_secret_key"
   JWT_EXPIRES_IN="7d"
   AI_PROVIDER="groq"
   GROQ_API_KEY="your_groq_api_key"
   STRIPE_SECRET_KEY="your_stripe_test_key"
   ```

4. **Initialize and Seed the Database:**
   ```bash
   npm run seed --workspace=backend
   ```

5. **Start Development Servers:**
   ```bash
   npm run dev
   ```
   * Frontend Application: `http://localhost:5173`
   * Backend REST API: `http://localhost:5000/api/v1`
   * API Health Check: `http://localhost:5000/health`


---

## Automated Testing

The repository maintains unit and integration test coverage across both client and server:

```bash
# Execute test suites across all workspaces
npm run test

# Run backend integration tests (Jest + Supertest)
npm run test --workspace=backend

# Run frontend component tests (Vitest)
npm run test --workspace=frontend
```

---

## Production Build

To compile TypeScript and produce production-optimised bundles:

```bash
npm run build
```

The compiled server outputs to `backend/dist/`, and the client bundle outputs to `frontend/dist/`.

---

## License

This project is licensed under the MIT License.
