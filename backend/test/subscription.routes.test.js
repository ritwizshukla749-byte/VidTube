import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const middlewareState = {
  user: { _id: "64b64c1f0000000000000001" },
};

vi.mock("../src/controllers/subscription.controllers.js", () => ({
  toggleSubscription: vi.fn((req, res) => {
    return res.status(200).json({
      route: "toggleSubscription",
      user: req.user,
      params: req.params,
    });
  }),
  getUserChannelSubscribers: vi.fn((req, res) => {
    return res.status(200).json({
      route: "getUserChannelSubscribers",
      user: req.user,
      params: req.params,
    });
  }),
  getSubscribedChannels: vi.fn((req, res) => {
    return res.status(200).json({
      route: "getSubscribedChannels",
      user: req.user,
      params: req.params,
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
const { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels } =
  await import("../src/controllers/subscription.controllers.js");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("subscription routes", () => {
  it("protects toggleSubscription route", async () => {
    const response = await request(app).post(
      "/api/v1/subscriptions/64b64c1f0000000000000002"
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "toggleSubscription",
      user: middlewareState.user,
      params: { channelId: "64b64c1f0000000000000002" },
    });
    expect(toggleSubscription).toHaveBeenCalledTimes(1);
  });

  it("protects getUserChannelSubscribers route", async () => {
    const response = await request(app).get(
      "/api/v1/subscriptions/subscribers/64b64c1f0000000000000002"
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "getUserChannelSubscribers",
      user: middlewareState.user,
      params: { channelId: "64b64c1f0000000000000002" },
    });
    expect(getUserChannelSubscribers).toHaveBeenCalledTimes(1);
  });

  it("protects getSubscribedChannels route", async () => {
    const response = await request(app).get(
      "/api/v1/subscriptions/subscribed/64b64c1f0000000000000001"
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "getSubscribedChannels",
      user: middlewareState.user,
      params: { subscriberId: "64b64c1f0000000000000001" },
    });
    expect(getSubscribedChannels).toHaveBeenCalledTimes(1);
  });
});
