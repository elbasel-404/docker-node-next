import type { Doctor } from "@repo/shared";
import { request } from "./request";

export async function getDoctors() {
  return request<{ data: Doctor[] }>("/api/doctors");
}
