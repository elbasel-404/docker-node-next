import { prisma } from "../prisma/client";
import { AppError } from "../errors/AppError";

export async function getImagingStudy(imagingStudyId: string) {
  const study = await prisma.imagingStudy.findUnique({
    where: {
      id: imagingStudyId,
    },
    select: {
      id: true,
      appointmentId: true,
      modality: true,
      description: true,
    },
  });

  if (!study) {
    throw new AppError(
      404,
      "IMAGING_STUDY_NOT_FOUND",
      "Imaging study not found.",
    );
  }

  return study;
}
