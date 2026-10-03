"use server";
import { CreateAppointmentInput, createAppointmentSchema } from "@repo/shared";
import { createAppointment } from "./lib/appointment";
import { revalidatePath } from "next/cache";
import { ApiRequestError } from "./lib/ApiRequestError";

export type CreateAppointmentActionState =
  | {
      success: true;
    }
  | {
      success: false;
      code: string;
      message: string;
    };

export async function createAppointmentAction(
  input: CreateAppointmentInput,
): Promise<CreateAppointmentActionState> {
  const parsed = createAppointmentSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      code: "VALIDATION_ERROR",
      message: "Please correct the form fields.",
    };
  }

  try {
    await createAppointment(parsed.data);

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
      message: "Unable to create the appointment.",
    };
  }
}
