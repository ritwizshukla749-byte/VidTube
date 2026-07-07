import request from "supertest";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../src/middlewares/auth.middlewares.js", () => ({
  verifyJWT: vi.fn((req, _res, next) => {
    req.user = { _id: "64b64c1f0000000000000001" };
    next();
  }),
  optionalVerifyJWT: vi.fn((_req, _res, next) => next()),
}));

const { app } = await import("../../src/app.js");

describe("healthcheck", () => {
  it("returns 200 with OK message", async () => {
    const response = await request(app).get("/api/v1/healthcheck");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      statusCode: 200,
      message: "OK",
      data: "Healthcheck passed!!",
      success: true,
    });
  });
});
