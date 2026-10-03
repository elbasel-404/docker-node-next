import { Router, type Router as ExpressRouter } from "express";
import { listDoctors } from "../services/doctorsService";

export const doctorsRouter: ExpressRouter = Router();

doctorsRouter.get("/", async (_req, res, next) => {
  try {
    const doctors = await listDoctors();
    res.json({ data: doctors });
  } catch (error) {
    next(error);
  }
});
