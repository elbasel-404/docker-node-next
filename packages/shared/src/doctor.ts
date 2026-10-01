import { z } from "zod";

export const createDoctorSchema = z.object({
  name: z.string().trim().min(1, "Doctor name is required"),
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
