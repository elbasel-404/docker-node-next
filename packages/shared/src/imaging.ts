import { z } from "zod";

export const imagingStudySchema = z.object({
  id: z.string().uuid(),
  appointmentId: z.string().uuid(),
  modality: z.string(),
  description: z.string().nullable(),
});

export type ImagingStudy = z.infer<typeof imagingStudySchema>;
