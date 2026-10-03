// import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { z } from "zod";
import { PrismaClient } from "./generated/prisma/client";
import { validateStartupEnv } from "../config/env.js";

const connectionStringSchema = z.string().min(1);
const connectionString = connectionStringSchema.parse(
  validateStartupEnv().DATABASE_URL,
);

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
