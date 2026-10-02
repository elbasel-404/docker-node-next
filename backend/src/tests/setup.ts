import { beforeAll, afterAll } from "vitest";
import { prisma } from "../prisma/client.js";

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});
