# Senior Full Stack Developer Take-Home Assignment

**Node.js + React + DICOM**

> **Focus on the core flow**  
> A reliable, well-explained core flow is more valuable than extra unfinished features.

---

## Assignment Overview

Build a small full-stack application that helps clinic staff manage a doctor's appointments for a single day and view one DICOM medical image linked to an appointment. The assignment is designed to assess practical engineering decisions, not the size of the finished product.

### What You Will Build

- A **Node.js** and **TypeScript** REST API with database persistence.
- A **React** and **TypeScript** scheduling interface.
- Server-side protection against overlapping appointments, including concurrent requests.
- A simple viewer for one supplied, anonymized, single-frame DICOM file.
- A small set of automated tests for the most important business rules.

### What We Provide

- One anonymized, single-frame `.dcm` file.
- The functional requirements and acceptance criteria in this document.
- Freedom to choose maintained Node.js, React, database, and DICOM-viewer libraries.

> **Important**  
> Use fictional data only. Do not add real patient information. This is a technical exercise and is not intended to be a production-ready or diagnostic medical system.

---

## 1. Required User Flow

A clinic staff member must be able to:

1. **View appointments** for a selected date.
2. **Filter appointments** by doctor and status.
3. **Create** an appointment.
4. **Change** an appointment's status.
5. **See a clear message** when a requested time conflicts with another appointment for the same doctor.
6. **Open and view** the DICOM image attached to a seeded appointment.

---

## 2. Suggested Data Model

You may adapt this model if you explain your reasoning.

| Entity            | Suggested Fields                                                                                             |
| :---------------- | :----------------------------------------------------------------------------------------------------------- |
| **Doctor**        | `id`, `name`                                                                                                 |
| **Appointment**   | `id`, `patientName`, `doctorId`, `startsAt`, `durationMinutes`, `status`, `reason`, `createdAt`, `updatedAt` |
| **Imaging Study** | `id`, `appointmentId`, `modality`, `description`, `dicomFilePath` (or equivalent reference)                  |

### Appointment Status Values

Use: `scheduled`, `checked_in`, `completed`, and `cancelled`.

---

## 3. Backend Requirements

Use **Node.js** and **TypeScript**. Express, Fastify, NestJS, or a comparable framework is acceptable.

### Required REST API Behavior

- List appointments with date, doctor, and status filters.
- Create an appointment.
- Update an appointment's status.
- Retrieve imaging-study metadata for an appointment.
- Serve the provided DICOM file through a documented endpoint (e.g., `GET /imaging-studies/:id/file`).

### Backend Quality Requirements

- Validate request data and return useful, consistent error responses.
- Prevent overlapping non-cancelled appointments for the same doctor.
- Remain correct when two conflicting create requests arrive concurrently.
- Return appropriate HTTP status codes, including a machine-readable conflict response.
- Persist data in a SQL or NoSQL database. A local or containerized database is acceptable.
- Include automated tests for the most important business rules.

### Authentication is Out of Scope

Assume requests come from an authenticated clinic staff user. A complete authentication system is not required. If you model authorization, a documented test identity or small stub is sufficient.

---

## 4. Frontend Requirements

Use **React** and **TypeScript**. Create a responsive interface containing:

- A date selector and doctor/status filters.
- An appointment list or schedule view.
- A create-appointment form with useful validation feedback.
- A way to change appointment status.
- A "View scan" action for the seeded appointment.
- Loading, empty, error, and successful mutation states.
- A conflict message that helps the user correct the appointment without losing all entered form data.

---

## 5. DICOM Viewer — Intentionally Limited Scope

Integrate an established browser imaging library such as **Cornerstone3D** with its DICOM image loader, or a maintained equivalent. Do not write your own DICOM parser.

### Required Viewer Behavior

- Render the supplied, anonymized, single-frame DICOM image.
- Open in a modal, drawer, or dedicated page.
- Resize correctly with its container.
- Show a loading state and a useful unsupported/corrupt-file error.
- Show only modality, study date when available, and image dimensions.
- Provide one Fit/Reset view control.
- Release viewer resources and event handlers when the view closes or unmounts.

### Not Required

- PACS or DICOMweb integration
- DICOM uploads
- Multi-series navigation
- Multi-frame playback
- Annotations or measurements
- MPR or 3D rendering
- Diagnostic-device certification

### Optional Only

Zoom, pan, and window/level controls are welcome enhancements, but they are not required and should not take priority over the core flow.

### Usability

The interface should be keyboard-usable and use semantic labels and controls. Clear behavior matters more than elaborate visual design.

---

## 6. Acceptance Criteria

### Appointment Creation

- A valid appointment is persisted and appears in the selected day's schedule.
- Required fields and date/time values are validated.
- `durationMinutes` must be a positive value.

### Conflict Protection

- Two non-cancelled appointments for the same doctor may not overlap.
- Adjacent appointments are allowed; an appointment ending at 10:30 may be followed by one starting at 10:30.
- Concurrent requests cannot both create overlapping appointments successfully.
- A conflict returns `HTTP 409`, or an equivalently justified response, with a machine-readable error code.
- The UI explains the conflict without clearing all entered form data.

### Appointment Listing and Status

- The selected date is applied consistently and the time-zone behavior is documented.
- Doctor and status filters can be combined.
- Loading, empty, and error states are visible.
- A valid status update persists and appears without a full page reload.
- Unsupported status values are rejected by the server.

### DICOM Viewing

- Selecting "View scan" opens the viewer and renders the supplied DICOM image.
- The UI shows modality and safe image metadata without displaying or logging patient-identifying DICOM fields.
- The viewer includes loading, error, and Fit/Reset behavior.
- Closing and reopening the viewer works without duplicate handlers, stale content, or a page reload.

### Quality and Operability

- The project runs from a clean checkout by following the `README`.
- Important business rules have automated tests.
- Secrets are not committed.
- Unexpected server errors do not expose stack traces or sensitive details to the client.
- Seed data makes the main workflow and DICOM viewer easy to review.

---

## 7. Technical Expectations

- Use current, maintained libraries that you are comfortable explaining.
- Keep client/server contracts consistent through shared types, generated types, or explicit mapping; explain the choice.
- Use meaningful Git commits when practical.
- Prefer a complete core flow over extra infrastructure or features.
- Do not build unrelated billing, notifications, patient accounts, or a design system.

### Optional Enhancements

- Docker-based setup or CI for linting/tests.
- Structured logging and request IDs.
- Basic role-based authorization stub.
- Deployed demo.
- DICOM zoom, pan, or window/level controls.

---

## 8. Submission Requirements

Submit the following:

1. A Git repository link or compressed source archive.
2. A `README` with exact setup, run, migration, seed, and test instructions.
3. A short **Architecture and Trade-offs** section.
4. A brief note disclosing any AI assistance and what you personally reviewed or changed.

### Architecture and Trade-offs Should Cover

- Project structure and major library choices.
- How concurrent appointment conflicts are prevented.
- How the DICOM viewer is initialized, resized, updated, and cleaned up in React.
- Time-zone assumptions.
- Security and privacy considerations.
- What you would improve next.

---

## 9. How the Submission Will Be Evaluated

| Area                   | Weight | Focus                                                          |
| :--------------------- | :----: | :------------------------------------------------------------- |
| **Backend and API**    |  20%   | Validation, persistence, REST behavior, and useful errors      |
| **Concurrency**        |  15%   | Correct overlap rules and database-level protection            |
| **React and UX**       |  20%   | Complete flow, server-state handling, forms, and UI states     |
| **DICOM Viewer**       |  15%   | Rendering, safe metadata, resizing, errors, reset, and cleanup |
| **Code Design**        |  10%   | Readability, structure, types, and proportional choices        |
| **Testing**            |  10%   | High-value tests for rules and failure cases                   |
| **Security and Setup** |   5%   | Safe handling, no secrets, and reproducible setup              |
| **Documentation**      |   5%   | Clear instructions, trade-offs, and limitations                |

---

### Use of Tools

Documentation, search engines, and AI tools are allowed. You remain responsible for understanding and explaining the submitted solution.

_Thank you, and good luck!_
