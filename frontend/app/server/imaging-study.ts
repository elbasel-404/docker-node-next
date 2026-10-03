import { request } from "./request";

export async function getImagingStudy(id: string) {
  return request<{
    data: {
      id: string;
      appointmentId: string;
      modality: string;
      description: string | null;
    };
  }>(`/api/imaging-studies/${id}`, {
    cache: "no-store",
  });
}
