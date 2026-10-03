import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createAppointment } from "../../services/appointmentService";
import { createTestDoctor, cleanupTestDoctor } from "../helpers/database";

describe("createAppointment", () => {
  let doctorId: string;
  beforeEach(async () => {
    const doctor = await createTestDoctor();
    doctorId = doctor.id;
  });

  afterEach(async () => {
    await cleanupTestDoctor(doctorId);
  });

  it("creates a valid appointment", async () => {
    const appointment = await createAppointment({
      patientName: "Demo Patient",
      doctorId: doctorId,
      startsAt: "2026-10-02T10:00:00.000Z",
      durationMinutes: 30,
      reason: "Routine consultation",
    });

    expect(appointment.patientName).toBe("Demo Patient");

    expect(appointment.startsAt).toBe("2026-10-02T10:00:00.000Z");

    expect(appointment.endsAt).toBe("2026-10-02T10:30:00.000Z");

    expect(appointment.status).toBe("scheduled");
  });

  it("rejects an unknown doctor", async () => {
    await expect(
      createAppointment({
        patientName: "Demo Patient",
        doctorId: "20000000-0000-4000-8000-000000000010",
        startsAt: "2026-10-02T10:00:00.000Z",
        durationMinutes: 30,
        reason: "Routine consultation",
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: "DOCTOR_NOT_FOUND",
    });
  });
});
