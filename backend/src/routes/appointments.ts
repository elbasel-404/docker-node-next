import { Router, type Router as ExpressRouter } from "express";

import {
  appointmentListQuerySchema,
  createAppointmentSchema,
  updateAppointmentStatusSchema,
} from "@repo/shared";

import {
  createAppointment,
  getAppointment,
  listAppointments,
  updateAppointmentStatus,
} from "../services/appointmentService";

export const appointmentsRouter: ExpressRouter = Router();

appointmentsRouter.get("/", async (req, res) => {
  const query = appointmentListQuerySchema.parse(req.query);

  const appointments = await listAppointments(query);

  res.json({
    data: appointments,
  });
});

appointmentsRouter.get("/:id", async (req, res) => {
  const appointment = await getAppointment(req.params.id);

  res.json({
    data: appointment,
  });
});

appointmentsRouter.post("/", async (req, res) => {
  const input = createAppointmentSchema.parse(req.body);

  const appointment = await createAppointment(input);

  res.status(201).json({
    data: appointment,
  });
});

appointmentsRouter.patch("/:id/status", async (req, res) => {
  const input = updateAppointmentStatusSchema.parse(req.body);

  const appointment = await updateAppointmentStatus(req.params.id, input);

  res.json({
    data: appointment,
  });
});
