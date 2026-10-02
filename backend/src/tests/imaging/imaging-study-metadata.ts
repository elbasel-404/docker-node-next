import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { prisma } from "../../prisma/client";
import { createTestDoctor, cleanupTestDoctor } from "../helpers/database";
import app from "../../app";

describe("GET /api/imaging-studies/:id", () => {
  let doctorId: string;
  let appointmentId: string;
  let studyId: string;

  beforeEach(async () => {
    const doctor = await createTestDoctor();
    doctorId = doctor.id;

    const appointment = await prisma.appointment.create({
      data: {
        patientName: "Anonymous Patient",
        doctorId,
        startsAt: new Date("2026-10-02T09:00:00.000Z"),
        endsAt: new Date("2026-10-02T09:30:00.000Z"),
        reason: "Imaging",
      },
    });

    appointmentId = appointment.id;

    const study = await prisma.imagingStudy.create({
      data: {
        appointmentId,
        modality: "CT",
        description: "Anonymized CT study",
        dicomFilePath: "./data/sample.dcm",
      },
    });

    studyId = study.id;
  });

  afterEach(async () => {
    await prisma.imagingStudy.deleteMany({
      where: { id: studyId },
    });

    await prisma.appointment.deleteMany({
      where: { id: appointmentId },
    });

    await cleanupTestDoctor(doctorId);
  });

  it("returns imaging metadata", async () => {
    const response = await request(app)
      .get(`/api/imaging-studies/${studyId}`)
      .expect(200);

    expect(response.body).toEqual({
      data: {
        id: studyId,
        appointmentId,
        modality: "CT",
        description: "Anonymized CT study",
      },
    });
  });

  it("does not expose the DICOM path", async () => {
    const response = await request(app)
      .get(`/api/imaging-studies/${studyId}`)
      .expect(200);

    expect(response.body.data).not.toHaveProperty("dicomFilePath");
  });

  it("returns 404 for an unknown study", async () => {
    const response = await request(app)
      .get("/api/imaging-studies/20000000-0000-4000-8000-000000000001")
      .expect(404);

    expect(response.body.error.code).toBe("IMAGING_STUDY_NOT_FOUND");
  });
});
