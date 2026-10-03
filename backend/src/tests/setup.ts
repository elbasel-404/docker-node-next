import { beforeAll, afterAll } from "vitest";
import { prisma } from "../prisma/client.js";
import { validateStartupEnv } from "../config/env.js";

validateStartupEnv();

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});
