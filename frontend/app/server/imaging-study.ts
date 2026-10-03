import type { ImagingStudy } from "@repo/shared";
import { request } from "./request";

export async function getImagingStudy(id: string) {
  return request<{ data: ImagingStudy }>(`/api/imaging-studies/${id}`, {
    cache: "no-store",
  });
}
