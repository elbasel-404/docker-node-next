# Clinic Scheduler

A small full-stack app for clinic staff to manage a doctor's appointments for a single day and to view one DICOM image linked to an appointment.

- **Backend:** Node.js, TypeScript, Express 5, Prisma 7, PostgreSQL 17, Zod
- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, Cornerstone3D
- **Shared contract:** `packages/shared` (Zod schemas and inferred TypeScript types used by both sides)
- **Tests:** Vitest and Supertest (backend)

---

## Contents

1. [Quick start](#quick-start)
2. [Configuration](#configuration)
3. [Commands](#commands)
4. [Seed data](#seed-data)
5. [API reference](#api-reference)
6. [Architecture and trade-offs](#architecture-and-trade-offs)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)
9. [Known limitations and next steps](#known-limitations-and-next-steps)
10. [AI assistance disclosure](#ai-assistance-disclosure)

---

## Quick start

Prerequisites: Docker with Compose v2, and [pnpm](https://pnpm.io) on the host (only needed for the convenience scripts; each one has a plain `docker compose exec` equivalent below).

```bash
# 1. Create your local environment file (development defaults, no real secrets)
cp .env.example .env

# 2. Build and start Postgres, the API and the web app
docker compose up --build

# 3. In a second terminal: apply migrations, then load seed data
pnpm db:deploy
pnpm db:seed

# 4. Run the backend tests
pnpm test:backend
```

Then open:

| Service          | URL                                                  |
| :--------------- | :--------------------------------------------------- |
| Web app          | http://localhost:3000 (redirects to `/appointments`) |
| API health check | http://localhost:4000/api/health                     |

To try the DICOM viewer, open the seeded **Patient One** appointment (09:00 with Dr. Sarah Ahmed) and click **View scan**.

Without pnpm on the host, run the same commands through Docker:

```bash
docker compose exec backend pnpm --dir backend exec prisma migrate deploy
docker compose exec backend pnpm --dir backend exec tsx src/prisma/seed.ts
docker compose exec backend pnpm --dir backend exec pnpm test
```

## API reference

### Endpoints

| Method  | Path                                                            | Description                                                                                                                             |
| :------ | :-------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`   | `/health`                                                       | Liveness check                                                                                                                          |
| `GET`   | `/doctors`                                                      | List doctors (`id`, `name`), ordered by name                                                                                            |
| `GET`   | `/appointments?date=YYYY-MM-DD&doctorId=<uuid>&status=<status>` | List appointments. All filters are optional and combine with AND. `date` is interpreted in the clinic time zone. Ordered by start time. |
| `GET`   | `/appointments/:id`                                             | Get one appointment                                                                                                                     |
| `POST`  | `/appointments`                                                 | Create an appointment (`201`)                                                                                                           |
| `PATCH` | `/appointments/:id/status`                                      | Change status                                                                                                                           |
| `GET`   | `/imaging-studies/:id`                                          | Imaging study metadata (never includes the file path)                                                                                   |
| `GET`   | `/imaging-studies/:id/file`                                     | Stream the DICOM file (`application/dicom`)                                                                                             |

Statuses: `scheduled`, `checked_in`, `completed`, `cancelled`.

### Create appointment

```http
POST /api/appointments
Content-Type: application/json

{
  "patientName": "Demo Patient",
  "doctorId": "<doctor uuid>",
  "startsAt": "2026-10-02T07:00:00.000Z",
  "durationMinutes": 30,
  "reason": "Routine consultation"
}
```

Rules: `startsAt` is an ISO-8601 datetime with offset; `durationMinutes` is an integer from 5 to 480; `patientName` is at most 120 characters; `reason` is at most 500.

Response `201`:

```json
{
  "data": {
    "id": "...",
    "patientName": "Demo Patient",
    "doctor": { "id": "...", "name": "Dr. Sarah Ahmed" },
    "startsAt": "2026-10-02T07:00:00.000Z",
    "endsAt": "2026-10-02T07:30:00.000Z",
    "status": "scheduled",
    "reason": "Routine consultation",
    "imagingStudy": null
  }
}
```

### Update status

```http
PATCH /api/appointments/:id/status
{ "status": "checked_in" }
```

Reactivating a cancelled appointment (`cancelled` to anything else) is checked against the overlap rule and returns `409` if the slot has since been taken.

### Error format

Every error uses the same envelope:

```json
{
  "error": {
    "code": "APPOINTMENT_CONFLICT",
    "message": "The doctor already has an appointment during this time."
  }
}
```

| HTTP | `code`                                                                                                      | When                                                                                           |
| :--- | :---------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| 400  | `VALIDATION_ERROR`                                                                                          | Body or query failed schema validation (`details` holds the flattened Zod errors)              |
| 400  | `INVALID_DATE`                                                                                              | `date` is not a valid `YYYY-MM-DD`                                                             |
| 404  | `DOCTOR_NOT_FOUND`, `APPOINTMENT_NOT_FOUND`, `IMAGING_STUDY_NOT_FOUND`, `DICOM_FILE_NOT_FOUND`, `NOT_FOUND` | Missing resource or route                                                                      |
| 409  | `APPOINTMENT_CONFLICT`                                                                                      | Overlaps another non-cancelled appointment for the same doctor                                 |
| 500  | `INTERNAL_SERVER_ERROR`                                                                                     | Unexpected error. The message is generic; details are logged server-side only, never returned. |

---

## Architecture and trade-offs

### Project structure

```
backend/            Express API, Prisma schema + migrations, seed, tests
  data/dicom/       Supplied anonymized .dcm file
  src/routes        HTTP layer (thin)
  src/services      Business logic and DTO mapping
  src/prisma        schema.prisma, migrations, seed, generated client
  src/tests         Vitest suites
frontend/           Next.js app (server components, server actions, DICOM viewer)
packages/shared/    Zod schemas and types shared by backend and frontend
docker-compose.yml  Postgres + backend + frontend for local development
```

### Shared contracts

`packages/shared` exports Zod schemas (`createAppointmentSchema`, `updateAppointmentStatusSchema`, `appointmentListQuerySchema`, `appointmentSchema`, `doctorSchema`, `imagingStudySchema`) and their inferred types. The backend validates requests with them and the frontend reuses the same types and the same create/status validation before calling the API. The backend maps Prisma rows to a response DTO (`toAppointmentDto`), so the API never returns raw database rows or fields such as `createdAt`.

### Preventing overlapping appointments (including concurrent requests)

Overlap protection is enforced **by the database**, not by application code. The initial migration adds:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Appointment"
ADD CONSTRAINT "appointment_no_overlap"
EXCLUDE USING gist (
  "doctorId" WITH =,
  tstzrange("startsAt", "endsAt", '[)') WITH &&
)
WHERE ("status" <> 'cancelled');

ALTER TABLE "Appointment"
ADD CONSTRAINT "Appointment_ends_after_starts_check"
CHECK ("endsAt" > "startsAt");
```

**Trade-off: `endsAt` instead of `durationMinutes`.** The suggested model stores `durationMinutes`. I store `endsAt` (computed from `startsAt + durationMinutes` on create) because the exclusion constraint needs a range. The API still accepts `durationMinutes`; responses return `startsAt` and `endsAt`.

**Trade-off: raw SQL.** Prisma's schema language cannot express exclusion constraints, so this constraint exists only in the migration SQL. Do not "fix" drift by regenerating migrations from `schema.prisma` alone.

The race is covered by an automated test (`concurrency.test.ts`) that fires two conflicting creates in parallel and asserts exactly one succeeds and the other fails with `409 APPOINTMENT_CONFLICT`.

### Time zones

- All instants are stored and transmitted in **UTC** (`timestamptz`, ISO-8601 strings).
- `CLINIC_TIMEZONE` (default `Africa/Cairo`) defines what "a day" means. The backend converts the requested `YYYY-MM-DD` into `[clinic-local midnight, next clinic-local midnight)` as UTC instants, so the day length is correct on DST transition days (23 or 25 hours).
- An appointment belongs to the day on which it **starts**. One that crosses midnight appears only on its start day.
- The form's date and time inputs are interpreted in the clinic time zone and converted to a UTC ISO string before sending. The schedule displays times in the clinic time zone, not the browser's.
- The frontend reads the zone from `NEXT_PUBLIC_CLINIC_TIMEZONE` (set from `CLINIC_TIMEZONE` by Docker Compose) and falls back to `Africa/Cairo`.
- Tests cover the day boundaries and the Cairo DST fallback day.

### DICOM viewer lifecycle (React)

The viewer is the `DicomViewer` client component, shown on a dedicated page (`/appointments/:id/scan`).

- **Initialization:** Cornerstone core and the DICOM image loader are initialized once per page load through a cached promise. On mount, an effect creates a `RenderingEngine`, enables a `STACK` viewport on a container `div`, loads `wadouri:<file URL>` with `imageLoader.loadAndCacheImage`, calls `setStack`, then `resetCamera` and `render`.
- **Loading and errors:** a status region shows "Loading scan..." and an `alert` region shows distinct messages for a missing file, a failed download and a decode/render failure.
- **Resize:** a `ResizeObserver` on the container calls `renderingEngine.resize(true, true)`, so the image follows its container.
- **Fit / Reset:** _Fit_ resets zoom; _Reset_ resets zoom and pan and re-centers.
- **Cleanup:** the effect's cleanup sets a `cancelled` flag (so late async results are ignored), disconnects the observer, removes the image from Cornerstone's cache and destroys the rendering engine. Closing and reopening the viewer therefore starts clean, with no duplicate observers or stale cached image.
- **Safe metadata:** the UI shows modality and description (from the database), study date and image dimensions (from the loader's study and pixel-module metadata). No patient-identifying DICOM tags are read, displayed or logged.
- **File delivery:** the browser requests `/api/imaging-studies/:id/file` from the Next.js server, which proxies to the backend with `Cache-Control: private, no-store`. The backend never exposes the filesystem path.

## AI assistance disclosure

Used multiple AI tools to plan/generate some of the code.
Everything was reviewed manually.
This README.md file was mostly generated using AI.
