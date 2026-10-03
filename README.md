# Clinic Scheduler

A small full-stack clinic appointment scheduling application built with **Node.js, TypeScript, Express, PostgreSQL, Prisma, Next.js, React, and Cornerstone3D**.

The application allows clinic staff to:

- View appointments for a selected date.
- Filter appointments by doctor and status.
- Create appointments with validation.
- Prevent overlapping appointments for the same doctor.
- Safely handle concurrent appointment creation.
- Update appointment status without a full page reload.
- View a seeded anonymized DICOM study attached to an appointment.

---

## Tech Stack

### Backend

- Node.js
- TypeScript
- Express
- PostgreSQL
- Prisma
- Zod
- Vitest
- Supertest

### Frontend

- Next.js App Router
- React
- TypeScript
- Server Components
- Server Actions
- Cornerstone3D
- `@cornerstonejs/dicom-image-loader`

### Workspace

The repository is organized as a pnpm workspace:

```text
.
├── backend/
├── frontend/
├── packages/
│   └── shared/
├── docker-compose.yml
├── package.json
└── pnpm-workspace.yaml
```

The `@repo/shared` package contains shared Zod schemas and inferred TypeScript types used by both the frontend and backend.

---

# Getting Started

```bash
# Install dependencies
pnpm install
# Start containers
docker compose up -d
# Setup environment
cp .env.example .env
# Deploy the database
pnpm db:deploy
# Seed the database
pnpm db:seed
```

Open the frontend on http:localhost:3000

---

# Testing

Run the backend test suite:

```bash
pnpm test
```

---

# Application Flow

The primary workflow is:

```text
Clinic staff
     │
     ▼
Next.js appointments page
     │
     ├── Select date
     ├── Filter doctor
     ├── Filter status
     └── Create appointment
             │
             ▼
       Server Action
             │
             ▼
       Express REST API
             │
             ▼
        Prisma/PostgreSQL
```

For a seeded imaging study:

```text
Appointments
     │
     ▼
View scan
     │
     ▼
Dedicated scan page
     │
     ▼
Cornerstone3D
     │
     ▼
Next.js DICOM proxy
     │
     ▼
Express DICOM endpoint
     │
     ▼
Supplied sample.dcm
```

---

# API

The backend exposes the following main endpoints.

## Health

```http
GET /health
```

Returns:

```json
{
  "status": "ok"
}
```

## List appointments

```http
GET /api/appointments
```

Supported query parameters:

```text
date
doctorId
status
```

Example:

```http
GET /api/appointments?date=2026-10-03&doctorId=<doctor-id>&status=scheduled
```

Filters can be combined.

## Get appointment

```http
GET /api/appointments/:id
```

Returns appointment information including its doctor and safe imaging-study metadata.

## Create appointment

```http
POST /api/appointments
```

Example:

```json
{
  "patientName": "Demo Patient",
  "doctorId": "00000000-0000-0000-0000-000000000001",
  "startsAt": "2026-10-03T10:00:00+03:00",
  "durationMinutes": 30,
  "reason": "Follow-up"
}
```

`startsAt` must contain an explicit timezone offset.

## Update appointment status

```http
PATCH /api/appointments/:id/status
```

Example:

```json
{
  "status": "checked_in"
}
```

Supported statuses:

```text
scheduled
checked_in
completed
cancelled
```

## Get imaging-study metadata

```http
GET /api/imaging-studies/:id
```

Only safe application metadata is returned.

The filesystem path of the DICOM file is never returned to the client.

## Get DICOM file

```http
GET /api/imaging-studies/:id/file
```

The endpoint streams the supplied DICOM file with:

```text
Content-Type: application/dicom
```

The frontend accesses the file through a Next.js server-side proxy rather than exposing the backend URL directly to the browser.

---

# Error Responses

API errors use a consistent structure:

```json
{
  "error": {
    "code": "APPOINTMENT_CONFLICT",
    "message": "The requested time conflicts with another appointment."
  }
}
```

Important error codes include:

```text
VALIDATION_ERROR
APPOINTMENT_CONFLICT
APPOINTMENT_NOT_FOUND
DOCTOR_NOT_FOUND
IMAGING_STUDY_NOT_FOUND
DICOM_FILE_NOT_FOUND
NOT_FOUND
INTERNAL_SERVER_ERROR
```

Unexpected server errors return a generic message and do not expose stack traces, database errors, filesystem paths, or other sensitive implementation details.

---

# Architecture

## Project Structure

```text
.
├── backend
│   ├── data
│   │   └── dicom
│   ├── src
│   │   ├── errors
│   │   ├── middleware
│   │   ├── prisma
│   │   ├── routes
│   │   ├── services
│   │   ├── tests
│   │   └── utils
│   └── ...
│
├── frontend
│   ├── app
│   │   ├── api
│   │   ├── appointments
│   │   ├── components
│   │   ├── server
│   │   └── utils
│   └── ...
│
└── packages
    └── shared
```

The backend follows a relatively simple route → service → Prisma structure.

The frontend uses Next.js Server Components for server-side reads and Client Components where browser interaction is required.

---

# Client/Server Contracts

The `packages/shared` workspace package owns the API input contracts.

For example, appointment creation is represented by a Zod schema:

```text
createAppointmentSchema
        │
        ├── Runtime validation
        │
        └── TypeScript inferred type
```

Both frontend and backend consume the same schema/type definitions.

This avoids maintaining separate frontend and backend representations of the same API contract.

Prisma-generated types remain backend-only because they represent database implementation details rather than an API contract.

---

# Appointment Concurrency

Preventing overlapping appointments is enforced by PostgreSQL rather than relying only on application-level checks.

The database contains an exclusion constraint equivalent to:

```sql
EXCLUDE USING gist (
  "doctorId" WITH =,
  tsrange("startsAt", "endsAt", '[)') WITH &&
)
WHERE ("status" <> 'cancelled');
```

The `[)` interval representation means:

```text
10:00 → 10:30
10:30 → 11:00
```

is valid because the intervals are adjacent rather than overlapping.

At the same time:

```text
10:00 → 11:00
10:30 → 11:30
```

is rejected for the same doctor.

Cancelled appointments are excluded from the conflict constraint.

---

# Timezone Handling

The application treats appointment timestamps as absolute instants.

PostgreSQL stores the appointment timestamps as `DateTime` values, while the API exchanges timestamps using ISO-8601 values with an explicit timezone offset.

The clinic timezone is configured using:

```env
CLINIC_TIMEZONE="Africa/Cairo"
```

## Calendar-day filtering

A request such as:

```http
GET /api/appointments?date=2026-10-03
```

means:

> appointments occurring during the `2026-10-03` calendar day in the configured clinic timezone.

It does **not** mean:

> midnight-to-midnight UTC.

This distinction prevents the result from changing depending on the timezone of the user's browser or server.

The frontend also displays appointment times using the clinic timezone.

The timezone utilities and tests cover the conversion between clinic-local calendar dates/times and absolute timestamps.

---

# Frontend Data Flow

The frontend uses Next.js Server Components and Server Actions.

## Reads

Server Components call a server-only API client:

```text
Server Component
      ↓
server API client
      ↓
Express REST API
```

The backend URL is therefore not exposed to browser JavaScript for these requests.

Appointment reads use uncached/fresh requests because appointment availability and status are mutable.

## Mutations

Interactive components call Server Actions:

```text
Client Component
      ↓
Server Action
      ↓
Express REST API
      ↓
PostgreSQL
      ↓
revalidatePath("/appointments")
```

After a successful mutation, Next.js invalidates the affected route so the next Server Component render contains the persisted state.

This avoids requiring a client-side data-fetching/cache library for the core workflow.

---

# Trade-offs

## PostgreSQL exclusion constraint

A database-level exclusion constraint was chosen instead of an application-level availability check because concurrent appointment creation must be safe.

The trade-off is that this uses a PostgreSQL-specific feature and requires the `btree_gist` extension. The stronger concurrency guarantee is more important for this assignment than keeping the database layer completely vendor-neutral.

## Next.js Server Actions

Server Actions are used for frontend mutations while the Express API remains the system's backend boundary.

This provides a simple browser → Next.js → Express flow while allowing cache invalidation after successful mutations.

---

# AI Assistance

AI tools were used during development for implementation guidance, debugging, test-case suggestions, API/architecture review, and documentation assistance.
