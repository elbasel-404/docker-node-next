import { Router } from "express";

import { prisma } from "../prisma/client.js";

export const doctorsRouter = Router();

doctorsRouter.get("/", async (_req, res, next) => {
  try {
    const doctors = await prisma.doctor.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    });

    res.json({
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
});
