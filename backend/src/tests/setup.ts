import { beforeAll, afterAll } from "vitest";
import { z } from "zod";
import { prisma } from "../prisma/client.js";
import { AppError } from "../errors/AppError.js";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  CLINIC_TIMEZONE: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new AppError(
    500,
    "MISSING_ENV_VARS",
    "Required environment variables are missing or invalid.",
  );
}

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});
