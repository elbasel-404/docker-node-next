import { z } from "zod";

export const appointmentStatusSchema = z.enum([
  "scheduled",
  "checked_in",
  "completed",
  "cancelled",
]);

export const createAppointmentSchema = z.object({
  patientName: z.string().trim().min(1, "Patient name is required"),
  doctorId: z.string().uuid("Invalid doctor ID"),
  startsAt: z.string().datetime({
    offset: true,
    message: "startsAt must be a valid ISO datetime",
  }),
  durationMinutes: z.coerce
    .number()
    .int("Duration must be a whole number")
    .positive("Duration must be greater than 0"),
  status: appointmentStatusSchema.default("scheduled"),
  reason: z.string().trim().min(1, "Reason is required"),
});

export const updateAppointmentStatusSchema = z.object({
  status: appointmentStatusSchema,
});

export const appointmentQuerySchema = z.object({
  date: z.string().date().optional(),
  doctorId: z.string().uuid().optional(),
  status: appointmentStatusSchema.optional(),
});

export const appointmentSchema = z.object({
  id: z.string().uuid(),
  patientName: z.string(),
  doctorId: z.string().uuid(),
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }),
  status: appointmentStatusSchema,
  reason: z.string(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>;

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export type UpdateAppointmentStatusInput = z.infer<
  typeof updateAppointmentStatusSchema
>;

export type AppointmentQuery = z.infer<typeof appointmentQuerySchema>;

export type Appointment = z.infer<typeof appointmentSchema>;
