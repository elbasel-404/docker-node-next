import { z } from "zod";

export const doctorSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

export type Doctor = z.infer<typeof doctorSchema>;
