import { expect, it } from "vitest";
import app from "../../app";
import request from "supertest";

it("returns a machine-readable validation error", async () => {
  const response = await request(app)
    .post("/api/appointments")
    .send({
      patientName: "",
      doctorId: "invalid",
      startsAt: "invalid",
      durationMinutes: -10,
      reason: "",
    })
    .expect(400);

  expect(response.body).toMatchObject({
    error: {
      code: "VALIDATION_ERROR",
      message: "Request validation failed.",
    },
  });

  expect(response.body.error.details).toBeDefined();
});
