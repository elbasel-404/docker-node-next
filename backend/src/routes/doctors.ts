import { Router } from "express";
import { listDoctors } from "../services/doctors";

export const doctorsRouter = Router();

doctorsRouter.get("/", async (_req, res, next) => {
  try {
    const doctors = await listDoctors();
    res.json({ data: doctors });
  } catch (error) {
    next(error);
  }
});
