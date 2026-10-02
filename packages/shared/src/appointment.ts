import { z } from "zod";

export const appointmentStatusSchema = z.enum([
  "scheduled",
  "checked_in",
  "completed",
  "cancelled",
]);

export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>;

export const createAppointmentSchema = z.object({
  patientName: z.string().trim().min(1, "Patient name is required"),

  doctorId: z.uuid("Invalid doctor ID"),

  startsAt: z.iso.datetime({
    offset: true,
  }),

  durationMinutes: z.number().positive("Duration must be positive"),

  reason: z.string().trim().min(1, "Reason is required"),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export const updateAppointmentStatusSchema = z.object({
  status: appointmentStatusSchema,
});

export type UpdateAppointmentStatusInput = z.infer<
  typeof updateAppointmentStatusSchema
>;

export const appointmentListQuerySchema = z.object({
  date: z.iso.date().optional(),

  doctorId: z.uuid().optional(),

  status: appointmentStatusSchema.optional(),
});

export type AppointmentListQuery = z.infer<typeof appointmentListQuerySchema>;
