"use server";
import {
  UpdateAppointmentStatusInput,
  updateAppointmentStatusSchema,
} from "@repo/shared";
import { updateAppointmentStatus } from "./lib/appointment";
import { revalidatePath } from "next/cache";
import { ApiRequestError } from "./lib/ApiRequestError";

export type UpdateStatusActionState =
  | {
      success: true;
    }
  | {
      success: false;
      code: string;
      message: string;
    };

export async function updateAppointmentStatusAction(
  appointmentId: string,
  input: UpdateAppointmentStatusInput,
): Promise<UpdateStatusActionState> {
  const parsed = updateAppointmentStatusSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      code: "VALIDATION_ERROR",
      message: "Invalid appointment status.",
    };
  }

  try {
    await updateAppointmentStatus(appointmentId, parsed.data);

    revalidatePath("/appointments");

    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return {
        success: false,
        code: error.code,
        message: error.message,
      };
    }

    return {
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message: "Unable to update the appointment.",
    };
  }
}
