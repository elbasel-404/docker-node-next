import { beforeAll, afterAll } from "vitest";
import { prisma } from "../prisma/client";
import { validateStartupEnv } from "../config/env";

validateStartupEnv();

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});
