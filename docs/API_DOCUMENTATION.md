# 📡 SkyHaven Monolith REST API Documentation

This document provides a comprehensive reference for all REST API endpoints available in the **SkyHaven Modular Monolith** backend (`http://localhost:5000/api/v1`).

---

## 🌐 Base URL & Headers

- **Base URL:** `http://localhost:5000/api/v1`
- **Healthcheck:** `http://localhost:5000/health`
- **Standard Request Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (for authenticated routes)

---

## 🔐 1. Authentication Module (`/api/v1/auth`)

### 1.1 User Registration
- **Endpoint:** `POST /api/v1/auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "password": "SecurePassword@123",
  "phone": "+1 555 987 6543"
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_abc123",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "role": "CUSTOMER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```

### 1.2 User Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "Pass@123"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_456def",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "CUSTOMER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```

### 1.3 Get Current User Profile
- **Endpoint:** `GET /api/v1/auth/me`
- **Access:** Authenticated (Bearer Token required)
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "usr_456def",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "CUSTOMER",
    "phone": "+1 555 000 1122",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

---

## ✈️ 2. Flights Module (`/api/v1/flights`)

### 2.1 Search Flights
- **Endpoint:** `GET /api/v1/flights/search`
- **Access:** Public
- **Query Parameters:**
  - `origin` (string, optional): 3-letter IATA origin code (e.g. `BOM`, `DEL`, `JFK`)
  - `destination` (string, optional): 3-letter IATA destination code (e.g. `GOI`, `LHR`, `DXB`)
  - `departureDate` (string, optional): ISO date format `YYYY-MM-DD`
  - `cabinClass` (enum, optional): `ECONOMY` | `PREMIUM_ECONOMY` | `BUSINESS` | `FIRST`
  - `passengers` (number, optional, default: 1)
  - `maxPrice` (number, optional): Maximum base fare filter
  - `airline` (string, optional): Filter by airline name
  - `sortBy` (enum, optional): `price_asc` | `price_desc` | `duration_asc` | `time_asc`
- **Response `200 OK`:**
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "id": "fl_101",
      "flightNumber": "SH-402",
      "airline": "SkyHaven Air",
      "origin": "BOM",
      "destination": "GOI",
      "originCity": "Mumbai",
      "destCity": "Goa",
      "departureTime": "2026-09-10T08:30:00.000Z",
      "arrivalTime": "2026-09-10T09:45:00.000Z",
      "duration": 75,
      "basePrice": 4200,
      "availableSeats": 84,
      "status": "SCHEDULED"
    }
  ]
}
```

### 2.2 Get Flight Details with Cabin Seat Map
- **Endpoint:** `GET /api/v1/flights/:id`
- **Access:** Public
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "flight": {
      "id": "fl_101",
      "flightNumber": "SH-402",
      "airline": "SkyHaven Air",
      "aircraftType": "Airbus A321neo",
      "origin": "BOM",
      "destination": "GOI"
    },
    "seats": [
      {
        "id": "seat_1a",
        "seatNumber": "1A",
        "cabinClass": "FIRST",
        "isAvailable": true,
        "priceMultiplier": 2.5
      }
    ]
  }
}
```

### 2.3 Get Featured / Popular Flights
- **Endpoint:** `GET /api/v1/flights/featured`
- **Access:** Public
- **Response `200 OK`:** Returns curated top trending routes.

### 2.4 Get Airports List
- **Endpoint:** `GET /api/v1/flights/airports`
- **Access:** Public
- **Response `200 OK`:** Returns available airport codes, cities, and countries.

---

## 🎟️ 3. Bookings & Payments Module (`/api/v1/bookings`)

### 3.1 Create Seat Reservation
- **Endpoint:** `POST /api/v1/bookings`
- **Access:** Authenticated
- **Request Body:**
```json
{
  "flightId": "fl_101",
  "seatIds": ["seat_1a"],
  "passengers": [
    {
      "name": "Jane Doe",
      "gender": "FEMALE",
      "age": 29,
      "passportNumber": "A12345678"
    }
  ],
  "paymentMethod": "SANDBOX_CARD"
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "bookingReference": "SH-884920",
    "status": "CONFIRMED",
    "totalAmount": 10500,
    "qrCode": "data:image/png;base64,...",
    "boardingPassUrl": "/confirmation/SH-884920"
  }
}
```

### 3.2 Get User Booking History
- **Endpoint:** `GET /api/v1/bookings/my-bookings`
- **Access:** Authenticated
- **Response `200 OK`:** Returns all active and historical bookings for the logged-in user.

### 3.3 Cancel Booking
- **Endpoint:** `PATCH /api/v1/bookings/:id/cancel`
- **Access:** Authenticated
- **Response `200 OK`:** Releases locked seats, updates status to `CANCELLED`, and calculates refund amount.

---

## 🤖 4. AI Query Assistant Module (`/api/v1/ai`)

### 4.1 Parse Natural Language Query
- **Endpoint:** `POST /api/v1/ai/parse`
- **Access:** Public
- **Request Body:**
```json
{
  "query": "Cheapest flight to Goa next weekend under 5000"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "origin": null,
    "destination": "GOI",
    "destName": "Goa",
    "departureDate": "2026-09-12",
    "cabinClass": "ECONOMY",
    "passengers": 1,
    "maxPrice": 5000
  }
}
```

---

## 🛠️ 5. Admin Module (`/api/v1/admin`)

*(Requires `Authorization: Bearer <TOKEN>` with role `ADMIN`)*

### 5.1 Telemetry & KPI Analytics
- **Endpoint:** `GET /api/v1/admin/stats`
- **Response `200 OK`:** Gross revenue, load factor percentage, active fleet count, total completed bookings.

### 5.2 Flight CRUD Management
- `POST /api/v1/admin/flights` — Create new flight schedule with automatic 120-seat layout provisioning.
- `PATCH /api/v1/admin/flights/:id` — Update flight status, delay, or gate allocation.
- `DELETE /api/v1/admin/flights/:id` — Archive/delete scheduled flight.

### 5.3 Live Bookings Inspection
- `GET /api/v1/admin/bookings` — View all system-wide reservations with real-time filters.
