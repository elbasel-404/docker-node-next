import { request } from "./request";

export async function getDoctors() {
  return request<{
    data: Array<{
      id: string;
      name: string;
    }>;
  }>("/api/doctors");
}
