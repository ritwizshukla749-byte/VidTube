import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const middlewareState = {
  user: { _id: "64b64c1f0000000000000001" },
};

vi.mock("../src/controllers/dashboard.controllers.js", () => ({
  getChannelStats: vi.fn((req, res) => {
    return res.status(200).json({
      route: "getChannelStats",
      user: req.user,
    });
  }),
  getChannelVideos: vi.fn((req, res) => {
    return res.status(200).json({
      route: "getChannelVideos",
      user: req.user,
    });
  }),
}));

vi.mock("../src/middlewares/auth.middlewares.js", () => ({
  verifyJWT: vi.fn((req, _res, next) => {
    req.user = middlewareState.user;
    next();
  }),
  optionalVerifyJWT: vi.fn((_req, _res, next) => next()),
}));

const { app } = await import("../src/app.js");
const { getChannelStats, getChannelVideos } =
  await import("../src/controllers/dashboard.controllers.js");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("dashboard routes", () => {
  it("protects getChannelStats route", async () => {
    const response = await request(app).get("/api/v1/dashboard/stats");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "getChannelStats",
      user: middlewareState.user,
    });
    expect(getChannelStats).toHaveBeenCalledTimes(1);
  });

  it("protects getChannelVideos route", async () => {
    const response = await request(app).get("/api/v1/dashboard/videos");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "getChannelVideos",
      user: middlewareState.user,
    });
    expect(getChannelVideos).toHaveBeenCalledTimes(1);
  });
});
