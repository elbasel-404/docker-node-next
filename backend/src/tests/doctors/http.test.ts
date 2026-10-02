import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createTestDoctor, cleanupTestDoctor } from "../helpers/database";
import app from "../../app";

describe("GET /api/doctors", () => {
  let doctorId: string;

  beforeEach(async () => {
    const doctor = await createTestDoctor("Dr. HTTP Test");
    doctorId = doctor.id;
  });

  afterEach(async () => {
    await cleanupTestDoctor(doctorId);
  });

  it("returns doctors", async () => {
    const response = await request(app).get("/api/doctors").expect(200);

    expect(response.body.data).toEqual(
      expect.arrayContaining([
        {
          id: doctorId,
          name: "Dr. HTTP Test",
        },
      ]),
    );
  });

  it("returns the expected response shape", async () => {
    const response = await request(app).get("/api/doctors").expect(200);

    expect(response.body).toHaveProperty("data");
    expect(Array.isArray(response.body.data)).toBe(true);

    for (const doctor of response.body.data) {
      expect(Object.keys(doctor).sort()).toEqual(["id", "name"]);
    }
  });
});
