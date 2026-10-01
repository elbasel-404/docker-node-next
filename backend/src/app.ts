import express from "express";
import cors from "cors";
import { prisma } from "./prisma/prisma";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/", async (_req, res) => {
  const users = await prisma.user.findMany();
  res.json({ users });
});

app.get("/create", async (_req, res) => {
  const users = await prisma.user.create({
    data: {
      email: Math.random().toString(36).substring(2, 15) + "@example.com",
      // email: "john.doe@example.com",
      name: "John Doe",
    },
  });
  res.json({ users });
});

app.get("/delete", async (_req, res) => {
  await prisma.user.deleteMany();
  res.json({ message: "All users deleted" });
});

app.get("/env", async (_req, res) => {
  res.json({ env: process.env });
});

export default app;
