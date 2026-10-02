import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDoctor, cleanupTestDoctor } from "../helpers/database";
import { prisma } from "../../prisma/client";
import { getImagingStudy } from "../../services/imagingStudyService";

describe("getImagingStudy", () => {
  let doctorId: string;
  let appointmentId: string;
  let imagingStudyId: string;

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

    imagingStudyId = study.id;
  });

  afterEach(async () => {
    await prisma.imagingStudy.deleteMany({
      where: {
        id: imagingStudyId,
      },
    });

    await prisma.appointment.deleteMany({
      where: {
        id: appointmentId,
        doctorId,
      },
    });

    await cleanupTestDoctor(doctorId);
  });

  it("returns safe imaging metadata", async () => {
    const study = await getImagingStudy(imagingStudyId);

    expect(study).toEqual({
      id: imagingStudyId,
      appointmentId,
      modality: "CT",
      description: "Anonymized CT study",
    });
  });

  it("does not expose the DICOM file path", async () => {
    const study = await getImagingStudy(imagingStudyId);

    expect(study).not.toHaveProperty("dicomFilePath");
  });

  it("returns null for a missing optional description", async () => {
    await prisma.imagingStudy.update({
      where: {
        id: imagingStudyId,
      },
      data: {
        description: null,
      },
    });

    const study = await getImagingStudy(imagingStudyId);

    expect(study?.description).toBeNull();
  });

  it("throws when the imaging study does not exist", async () => {
    await expect(
      getImagingStudy("20000000-0000-4000-8000-000000000001"),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: "IMAGING_STUDY_NOT_FOUND",
    });
  });
});
