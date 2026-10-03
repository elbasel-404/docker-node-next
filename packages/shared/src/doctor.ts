import { z } from "zod";

export const createDoctorSchema = z.object({
  name: z.string().trim().min(1, "Doctor name is required"),
});

export const doctorSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1),
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type Doctor = z.infer<typeof doctorSchema>;
