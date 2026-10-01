import express from "express";
import cors from "cors";
import { appointmentsRouter } from "./routes/appointments";
import { errorHandler } from "./middleware/errorHandler";
import { doctorsRouter } from "./routes/doctors";
import { imagingStudiesRouter } from "./routes/imagingStudies";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/appointments", appointmentsRouter);

app.use("/api/doctors", doctorsRouter);

app.use("/api/imaging-studies", imagingStudiesRouter);

app.use(errorHandler);

export default app;
