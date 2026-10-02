import { afterEach, beforeEach, describe, expect, it } from "vitest";

import request from "supertest";
import app from "../../app";
import { createTestDoctor, cleanupTestDoctor } from "../helpers/database";

describe("appointment API", () => {
  let doctorId: string;

  beforeEach(async () => {
    const doctor = await createTestDoctor();
    doctorId = doctor.id;
  });

  afterEach(async () => {
    await cleanupTestDoctor(doctorId);
  });

  it("creates an appointment", async () => {
    const response = await request(app).post("/api/appointments").send({
      patientName: "Demo Patient",
      doctorId: doctorId,
      startsAt: "2026-10-02T10:00:00.000Z",
      durationMinutes: 30,
      reason: "Routine consultation",
    });

    expect(response.status).toBe(201);

    expect(response.body.data).toMatchObject({
      patientName: "Demo Patient",
      doctorId: doctorId,
      status: "scheduled",
    });
  });

  it("returns validation errors", async () => {
    const response = await request(app).post("/api/appointments").send({
      patientName: "",
      doctorId: "invalid",
    });

    expect(response.status).toBe(400);

    expect(response.body.error).toMatchObject({
      code: "VALIDATION_ERROR",
    });
  });

  it("returns 409 for an overlapping appointment", async () => {
    const payload = {
      patientName: "Patient One",
      doctorId: doctorId,
      startsAt: "2026-10-02T10:00:00.000Z",
      durationMinutes: 60,
      reason: "Existing appointment",
    };

    await request(app).post("/api/appointments").send(payload).expect(201);

    const response = await request(app)
      .post("/api/appointments")
      .send({
        ...payload,
        patientName: "Patient Two",
        startsAt: "2026-10-02T10:30:00.000Z",
      });

    expect(response.status).toBe(409);

    expect(response.body.error).toMatchObject({
      code: "APPOINTMENT_CONFLICT",
    });
  });
});
