# Clinic Appointment System

A full-stack application for managing clinic appointments with multi-doctor scheduling and imaging study integration.

## Setup & Running

- `docker compose up --build`
- `pnpm i`
- `pnpm db:deploy`
- `pnpm db:seed`
- Open frontend on http://localhost:3000/

## Architecture

### Timezone Handling

Appointment timestamps are stored as absolute instants in PostgreSQL and exchanged through the API as ISO-8601 timestamps with an explicit timezone offset. The clinic operates in the `CLINIC_TIMEZONE` IANA timezone (default: `Africa/Cairo`), configurable via the environment variable.

**Key principles:**

- **Database:** Timestamps are stored as absolute UTC instants. Each appointment has `startsAt` and `endsAt` as `DateTime` fields representing precise moments in time.
- **API contracts:** All appointment timestamps in API requests and responses include an explicit timezone offset (e.g., `2026-10-02T10:00:00+03:00`). This prevents the server from guessing the client's intended timezone.
- **Calendar filtering:** Date-based queries such as `GET /appointments?date=2026-10-02` are interpreted as clinic-local calendar days. An appointment at `2026-10-02T00:30:00+03:00` (Cairo time) is stored as `2026-10-01T21:30:00Z` (UTC) but is correctly included when filtering for `date=2026-10-02`.
- **Frontend display:** Appointment times and dates are always displayed in the clinic timezone, not the browser's local timezone. This ensures consistency across clients in different timezones.

**Example scenario:**

1. A user in New York (UTC-5) accesses the system.
2. They select October 2, 2026 and 10:00 AM for a new appointment.
3. The frontend interprets this in Cairo time (Africa/Cairo, UTC+3): `2026-10-02T10:00:00+03:00`.
4. This converts to an absolute instant: `2026-10-01T21:00:00Z` (UTC).
5. The backend stores this instant in PostgreSQL.
6. When the user queries appointments for October 2, the backend looks for all appointments between midnight October 2 and midnight October 3 in Cairo time, which correctly includes this appointment.
7. The UI displays the time as 10:00, which is correct for the clinic (and happens to be 5:00 AM in New York).

**Utility functions:**

- Backend (`src/utils/timezone.ts`):
  - `getClinicTimezone()`: Returns the configured clinic timezone.
  - `getClinicDayRange(date: string)`: Converts a calendar date (YYYY-MM-DD) to UTC boundaries representing the full day in clinic-local time.

- Frontend (`src/lib/timezone.ts`):
  - `getClinicTimezone()`: Returns the clinic timezone.
  - `formatAppointmentDate(value: string)`: Formats an ISO timestamp as a clinic-local date (e.g., "Oct 2, 2026").
  - `formatAppointmentTime(value: string)`: Formats an ISO timestamp as a clinic-local time (e.g., "10:30").
  - `formatAppointmentDateTime(value: string)`: Formats an ISO timestamp as clinic-local date and time.
  - `clinicDateTimeToIso(date: string, time: string)`: Converts form inputs (separate date and time in YYYY-MM-DD and HH:mm format) to an ISO timestamp with the clinic timezone offset.
  - `getClinicLocalDate(value: string)`: Extracts the clinic-local date (YYYY-MM-DD) from an ISO timestamp.
  - `getClinicLocalTime(value: string)`: Extracts the clinic-local time (HH:mm) from an ISO timestamp.

**Environment configuration:**

```env
# Default: Africa/Cairo
# Use any IANA timezone identifier
CLINIC_TIMEZONE="Africa/Cairo"
```

Why IANA timezones instead of offsets? IANA timezones encode historical daylight saving time rules and other civil-time regulations. An offset like `+03:00` can change if government policies change, but an IANA identifier like `Africa/Cairo` always represents the current rules for that location.
