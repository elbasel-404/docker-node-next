import { Router } from "express";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";

import { prisma } from "../prisma/client.js";
import { AppError } from "../errors/AppError.js";
import { getImagingStudy } from "../services/imagingStudyService.js";

export const imagingStudiesRouter = Router();

imagingStudiesRouter.get("/:id", async (req, res, next) => {
  try {
    const study = await getImagingStudy(req.params.id);

    res.json({
      data: study,
    });
  } catch (error) {
    next(error);
  }
});

imagingStudiesRouter.get("/:id/file", async (req, res, next) => {
  try {
    const study = await prisma.imagingStudy.findUnique({
      where: {
        id: req.params.id,
      },
      select: {
        dicomFilePath: true,
      },
    });

    if (!study) {
      throw new AppError(
        404,
        "IMAGING_STUDY_NOT_FOUND",
        "Imaging study not found.",
      );
    }

    let fileStats;

    try {
      fileStats = await stat(study.dicomFilePath);
    } catch {
      throw new AppError(
        404,
        "DICOM_FILE_NOT_FOUND",
        "The DICOM file could not be found.",
      );
    }

    if (!fileStats.isFile()) {
      throw new AppError(
        404,
        "DICOM_FILE_NOT_FOUND",
        "The DICOM file could not be found.",
      );
    }

    res.setHeader("Content-Type", "application/dicom");

    res.setHeader("Content-Length", fileStats.size);

    createReadStream(study.dicomFilePath).pipe(res);
  } catch (error) {
    next(error);
  }
});
