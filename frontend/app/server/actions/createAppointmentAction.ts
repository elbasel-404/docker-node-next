"use server";
import { CreateAppointmentInput, createAppointmentSchema } from "@repo/shared";
import { revalidatePath } from "next/cache";
import { ApiRequestError } from "../ApiRequestError";
import { createAppointment } from "../appointment";

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
    const firstMessage =
      parsed.error.issues[0]?.message ?? "Invalid form data.";

    return {
      success: false,
      code: "VALIDATION_ERROR",
      message: firstMessage,
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
