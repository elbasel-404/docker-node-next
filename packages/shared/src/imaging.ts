import { z } from "zod";

export const imagingStudySchema = z.object({
  id: z.string().uuid(),
  appointmentId: z.string().uuid(),
  modality: z.string(),
  description: z.string().nullable(),
  studyDate: z.string().datetime({ offset: true }).nullable(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
});

export type ImagingStudy = z.infer<typeof imagingStudySchema>;
