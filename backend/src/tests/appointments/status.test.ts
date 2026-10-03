import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../app";
import { createTestDoctor, cleanupTestDoctor } from "../helpers/database";
import { prisma } from "../../prisma/client.js";

describe("appointment status API", () => {
  let doctorId: string;

  beforeEach(async () => {
    const doctor = await createTestDoctor();
    doctorId = doctor.id;
  });

  afterEach(async () => {
    await cleanupTestDoctor(doctorId);
  });

  it("updates a status successfully", async () => {
    const appointment = await prisma.appointment.create({
      data: {
        patientName: "Patient One",
        doctorId,
        startsAt: new Date("2026-10-02T10:00:00.000Z"),
        endsAt: new Date("2026-10-02T10:30:00.000Z"),
        reason: "Follow-up",
      },
    });

    const response = await request(app)
      .patch(`/api/appointments/${appointment.id}/status`)
      .send({ status: "checked_in" });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("checked_in");
  });

  it("rejects an invalid status value", async () => {
    const appointment = await prisma.appointment.create({
      data: {
        patientName: "Patient One",
        doctorId,
        startsAt: new Date("2026-10-02T10:00:00.000Z"),
        endsAt: new Date("2026-10-02T10:30:00.000Z"),
        reason: "Follow-up",
      },
    });

    const response = await request(app)
      .patch(`/api/appointments/${appointment.id}/status`)
      .send({ status: "invalid_status" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 404 for an unknown appointment id", async () => {
    const response = await request(app)
      .patch("/api/appointments/20000000-0000-4000-8000-000000000001/status")
      .send({ status: "scheduled" });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("APPOINTMENT_NOT_FOUND");
  });

  it("returns 409 when reactivating a cancelled appointment overlaps another booking", async () => {
    const first = await prisma.appointment.create({
      data: {
        patientName: "Patient A",
        doctorId,
        startsAt: new Date("2026-10-02T10:00:00.000Z"),
        endsAt: new Date("2026-10-02T10:30:00.000Z"),
        reason: "Existing booking",
      },
    });

    await prisma.appointment.update({
      where: { id: first.id },
      data: { status: "cancelled" },
    });

    const second = await prisma.appointment.create({
      data: {
        patientName: "Patient B",
        doctorId,
        startsAt: new Date("2026-10-02T10:15:00.000Z"),
        endsAt: new Date("2026-10-02T10:45:00.000Z"),
        reason: "Overlapping booking",
      },
    });

    const response = await request(app)
      .patch(`/api/appointments/${first.id}/status`)
      .send({ status: "scheduled" });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("APPOINTMENT_CONFLICT");

    await prisma.appointment.update({
      where: { id: second.id },
      data: { status: "cancelled" },
    });
  });
});
