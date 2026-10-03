import {
  CreateAppointmentInput,
  UpdateAppointmentStatusInput,
} from "@repo/shared";
import { AppointmentListQuery } from "@repo/shared";
import { request } from "./request";

export async function getAppointments(query: AppointmentListQuery) {
  const params = new URLSearchParams();

  if (query.date) {
    params.set("date", query.date);
  }

  if (query.doctorId) {
    params.set("doctorId", query.doctorId);
  }

  if (query.status) {
    params.set("status", query.status);
  }

  const queryString = params.toString();

  type RequestType = {
    data: Array<{
      id: string;
      patientName: string;
      doctorId: string;
      startsAt: string;
      endsAt: string;
      status: "scheduled" | "checked_in" | "completed" | "cancelled";
      reason: string;
      doctor: {
        id: string;
        name: string;
      };
      imagingStudy: {
        id: string;
        appointmentId: string;
        modality: string;
        description: string | null;
      } | null;
    }>;
  };

  return request<RequestType>(
    `/api/appointments${queryString ? `?${queryString}` : ""}`,
    {
      next: {
        tags: ["appointments"],
      },
    },
  );
}

export async function getAppointment(id: string) {
  return request<{
    data: {
      id: string;
      patientName: string;
      doctor: {
        id: string;
        name: string;
      };
      startsAt: string;
      endsAt: string;
      status: "scheduled" | "checked_in" | "completed" | "cancelled";
      reason: string;
      imagingStudy: {
        id: string;
        appointmentId: string;
        modality: string;
        description: string | null;
      } | null;
    };
  }>(`/api/appointments/${id}`, {
    cache: "no-store",
  });
}
export async function createAppointment(input: CreateAppointmentInput) {
  return request("/api/appointments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateAppointmentStatus(
  id: string,
  input: UpdateAppointmentStatusInput,
) {
  return request(`/api/appointments/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
