import { describe, expect, it, beforeEach, vi } from "vitest";
import { ApiError } from "../src/utils/ApiError.js";

vi.mock("../src/models/subscription.models.js", () => ({
  Subscription: {
    findOne: vi.fn(),
    deleteOne: vi.fn(),
    create: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock("../src/models/user.models.js", () => ({
  User: { findById: vi.fn() },
}));

const {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} = await import("../src/controllers/subscription.controllers.js");
const { Subscription } = await import("../src/models/subscription.models.js");
const { User } = await import("../src/models/user.models.js");

const userId = "64b64c1f0000000000000001";
const channelId = "64b64c1f0000000000000002";
const otherChannelId = "64b64c1f0000000000000003";

const createResponse = () => {
  let settle;
  const settled = new Promise((resolve) => {
    settle = resolve;
  });

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn((payload) => {
      settle({ kind: "json", payload });
      return res;
    }),
  };

  const next = vi.fn((err) => {
    settle({ kind: "next", err });
  });

  return { res, next, settled };
};

const invoke = async (handler, req = {}) => {
  const { res, next, settled } = createResponse();
  handler(req, res, next);
  return { res, next, outcome: await settled };
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("toggleSubscription", () => {
  it("rejects invalid channelId", async () => {
    const { outcome } = await invoke(toggleSubscription, {
      params: { channelId: "bad" },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("rejects subscribing to own channel", async () => {
    const { outcome } = await invoke(toggleSubscription, {
      params: { channelId: userId },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("returns 404 if channel user does not exist", async () => {
    User.findById.mockResolvedValue(null);

    const { outcome } = await invoke(toggleSubscription, {
      params: { channelId: otherChannelId },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(404);
  });

  it("unsubscribes if already subscribed", async () => {
    User.findById.mockResolvedValue({ _id: channelId });
    Subscription.findOne.mockResolvedValue({ _id: "existing-sub" });

    const { res, outcome } = await invoke(toggleSubscription, {
      params: { channelId },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(Subscription.deleteOne).toHaveBeenCalledWith({
      subscriber: userId,
      channel: channelId,
    });
  });

  it("subscribes if not already subscribed", async () => {
    User.findById.mockResolvedValue({ _id: channelId });
    Subscription.findOne.mockResolvedValue(null);

    const { res, outcome } = await invoke(toggleSubscription, {
      params: { channelId },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(Subscription.create).toHaveBeenCalledWith({
      subscriber: userId,
      channel: channelId,
    });
  });
});

describe("getUserChannelSubscribers", () => {
  it("rejects invalid channelId", async () => {
    const { outcome } = await invoke(getUserChannelSubscribers, {
      params: { channelId: "bad" },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("returns subscriber list", async () => {
    const docs = [{ _id: "sub1", subscriber: { username: "user1" } }];
    Subscription.find.mockReturnValue({
      populate: vi.fn().mockResolvedValue(docs),
    });

    const { res, outcome } = await invoke(getUserChannelSubscribers, {
      params: { channelId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(outcome.payload.data).toEqual(docs);
  });
});

describe("getSubscribedChannels", () => {
  it("rejects invalid subscriberId", async () => {
    const { outcome } = await invoke(getSubscribedChannels, {
      params: { subscriberId: "bad" },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("returns subscribed channels list", async () => {
    const docs = [{ _id: "sub1", channel: { username: "channel1" } }];
    Subscription.find.mockReturnValue({
      populate: vi.fn().mockResolvedValue(docs),
    });

    const { res, outcome } = await invoke(getSubscribedChannels, {
      params: { subscriberId: userId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(outcome.payload.data).toEqual(docs);
  });
});
