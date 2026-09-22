# Vehicle Rental and Reservation Subsystem (VRRS)

Web application for **SwitchWheels Enterprise** (Huye) to manage customers, fleet vehicles, reservations/rentals, and reporting.

## Stack

| Layer | Technology | Port |
|-------|------------|------|
| Frontend | React + Vite + Tailwind | **5180** |
| Backend | Express + Mongoose + express-session | **5560** |
| Database | MongoDB **VRRS** | — |

## Quick start

```bash
cd vrrs/backend && cp .env.example .env && npm install && npm run dev
cd vrrs/frontend && npm install && npm run dev
```

Open http://localhost:5180 — login: `admin` / `admin123`

## Features

| Feature | Implementation |
|---------|----------------|
| MongoDB database **VRRS** | `backend/config/db.js` |
| ERD with PK/FK | Below |
| Level 0 DFD | Below |
| CRUD + search | Customers, vehicles, reservations, users |
| Session login | Cookie `vrrs.sid`, `withCredentials` |
| Roles | admin, manager, staff |
| Report | `GET /api/reports/reservation-rental` |

---

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
  CUSTOMERS ||--o{ RESERVATION_RENTALS : "makes"
  VEHICLES ||--o{ RESERVATION_RENTALS : "involves"
  USERS ||--o{ RESERVATION_RENTALS : "records"

  CUSTOMERS {
    int customer_id PK
    varchar full_name
    varchar national_id UK
    varchar phone
    varchar email
    varchar address
  }

  VEHICLES {
    int vehicle_id PK
    varchar plate_number UK
    varchar brand
    varchar model
    int year
    varchar vehicle_type
    decimal purchase_price
    enum status
  }

  RESERVATION_RENTALS {
    int reservation_rental_id PK
    date reservation_date
    date start_date
    date end_date
    enum reservation_status
    date rental_date
    date return_date
    decimal rental_fee
    enum rental_status
    int customer_id FK
    int vehicle_id FK
    int user_id FK
  }

  USERS {
    int user_id PK
    varchar user_name UK
    varchar password
    enum role
  }
```

### Relationships

1. **Customer (1) — (M) Reservation_Rental**
2. **Vehicle (1) — (M) Reservation_Rental**
3. **User (1) — (M) Reservation_Rental**

---

## Level 0 DFD

External entities: **Customer**, **User**, **Manager**

| Process | Data stores |
|---------|-------------|
| 1.0 Manage Customers | D1 Customers |
| 2.0 Manage Vehicles | D2 Vehicles |
| 3.0 Manage Reservation/Rental | D1, D2, D3 |
| 4.0 Generate Reports | D1, D2, D3 |
| 5.0 User Authentication | D4 Users |

```mermaid
flowchart TB
  Cust["Customer"]
  User["User"]
  Mgr["Manager"]
  P1(("1.0 Manage Customers"))
  P2(("2.0 Manage Vehicles"))
  P3(("3.0 Manage Reservation/Rental"))
  P4(("4.0 Generate Reports"))
  P5(("5.0 Authentication"))
  D1[("D1 Customers")]
  D2[("D2 Vehicles")]
  D3[("D3 Reservations")]
  D4[("D4 Users")]
  Rpt["Reservation Rental Report"]

  Cust --> P1 --> D1
  User --> P2 --> D2
  User --> P3
  P3 --> D1
  P3 --> D2
  P3 --> D3
  User --> P5 --> D4
  Mgr --> P4
  D1 --> P4
  D2 --> P4
  D3 --> P4
  P4 --> Rpt
```

---

## API

| Method | Endpoint |
|--------|----------|
| POST | `/api/auth/login` |
| POST | `/api/auth/logout` |
| GET | `/api/auth/me` |
| CRUD | `/api/customers`, `/api/vehicles`, `/api/reservations` |
| GET | `*/search?q=` |
| CRUD | `/api/users` (admin) |
| GET | `/api/reports/reservation-rental` (manager/admin) — full report |
| GET | `/api/reports?startDate=&endDate=` (manager/admin) — report by date |

---

## Project structure

```
vrrs/
├── README.md
├── backend/          ← MongoDB (database VRRS)
└── frontend/
```
