import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { prisma } from "../../prisma/client";
import { createTestDoctor, cleanupTestDoctor } from "../helpers/database";
import app from "../../app";

describe("GET /api/imaging-studies/:id/file", () => {
  let doctorId: string;
  let appointmentId: string;
  let studyId: string;
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(tmpdir(), "clinic-dicom-"));

    const filePath = path.join(tempDir, "sample.dcm");

    await writeFile(filePath, Buffer.from("test-dicom-content"));

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
        description: "Test study",
        dicomFilePath: filePath,
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

    await rm(tempDir, {
      recursive: true,
      force: true,
    });
  });

  it("serves the DICOM file", async () => {
    const response = await request(app)
      .get(`/api/imaging-studies/${studyId}/file`)
      .expect(200);

    expect(response.headers["content-type"]).toContain("application/dicom");

    expect(response.body).toEqual(Buffer.from("test-dicom-content"));
  });

  it("returns 404 when the DICOM file is missing", async () => {
    await prisma.imagingStudy.update({
      where: {
        id: studyId,
      },
      data: {
        dicomFilePath: path.join(tempDir, "does-not-exist.dcm"),
      },
    });

    const response = await request(app)
      .get(`/api/imaging-studies/${studyId}/file`)
      .expect(404);

    expect(response.body.error.code).toBe("DICOM_FILE_NOT_FOUND");
  });

  it("returns 404 for an unknown imaging study", async () => {
    const response = await request(app)
      .get("/api/imaging-studies/20000000-0000-4000-8000-000000000001/file")
      .expect(404);

    expect(response.body.error.code).toBe("IMAGING_STUDY_NOT_FOUND");
  });
});
