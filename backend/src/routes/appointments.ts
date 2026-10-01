import { Router } from "express";

import {
  appointmentListQuerySchema,
  createAppointmentSchema,
  updateAppointmentStatusSchema,
} from "@repo/shared";

import {
  createAppointment,
  listAppointments,
  updateAppointmentStatus,
} from "../services/appointmentService.js";

export const appointmentsRouter = Router();

appointmentsRouter.get("/", async (req, res, next) => {
  try {
    const query = appointmentListQuerySchema.parse(req.query);

    const appointments = await listAppointments(query);

    res.json({
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
});

appointmentsRouter.post("/", async (req, res, next) => {
  try {
    const input = createAppointmentSchema.parse(req.body);

    const appointment = await createAppointment(input);

    res.status(201).json({
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
});

appointmentsRouter.patch("/:id/status", async (req, res, next) => {
  try {
    const input = updateAppointmentStatusSchema.parse(req.body);

    const appointment = await updateAppointmentStatus(req.params.id, input);

    res.json({
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
});
