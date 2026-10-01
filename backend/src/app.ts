import express from "express";
import cors from "cors";
import { prisma } from "./prisma/prisma";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

export default app;
