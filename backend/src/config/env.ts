import { z } from "zod";
import { AppError } from "../errors/AppError";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  CLINIC_TIMEZONE: z.string().min(1),
});

let validatedEnv: z.infer<typeof envSchema> | undefined;

export function validateStartupEnv(env: NodeJS.ProcessEnv = process.env) {
  if (validatedEnv) {
    return validatedEnv;
  }

  const parsed = envSchema.safeParse(env);

  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((issue) => issue.path[0])
      .filter((value): value is string => typeof value === "string")
      .join(", ");

    throw new AppError(
      500,
      "MISSING_ENV_VARS",
      `Missing required environment variables: ${missing || "unknown"}.`,
    );
  }

  validatedEnv = parsed.data;

  return validatedEnv;
}
