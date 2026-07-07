import { describe, expect, it, beforeEach, vi } from "vitest";

vi.mock("../src/models/video.models.js", () => ({
  Video: {
    aggregate: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock("../src/models/subscription.models.js", () => ({
  Subscription: { countDocuments: vi.fn() },
}));

const { getChannelStats, getChannelVideos } = await import(
  "../src/controllers/dashboard.controllers.js"
);
const { Video } = await import("../src/models/video.models.js");
const { Subscription } = await import("../src/models/subscription.models.js");

const userId = "64b64c1f0000000000000001";

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

describe("getChannelStats", () => {
  it("returns stats with zero values when no videos exist", async () => {
    Subscription.countDocuments.mockResolvedValue(0);
    Video.aggregate.mockResolvedValue([]);

    const { res, outcome } = await invoke(getChannelStats, {
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(outcome.payload.data).toEqual({
      totalSubscribers: 0,
      totalVideos: 0,
      totalViews: 0,
      totalLikes: 0,
    });
  });

  it("returns aggregated stats when videos exist", async () => {
    Subscription.countDocuments.mockResolvedValue(5);
    Video.aggregate.mockResolvedValue([
      {
        totalVideos: 3,
        totalViews: 100,
        totalLikes: 12,
      },
    ]);

    const { res, outcome } = await invoke(getChannelStats, {
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(outcome.payload.data).toEqual({
      totalSubscribers: 5,
      totalVideos: 3,
      totalViews: 100,
      totalLikes: 12,
    });
  });
});

describe("getChannelVideos", () => {
  it("returns all videos for the channel sorted by createdAt desc", async () => {
    const docs = [
      { _id: "v1", title: "Video 1" },
      { _id: "v2", title: "Video 2" },
    ];
    Video.find.mockReturnValue({
      sort: vi.fn().mockResolvedValue(docs),
    });

    const { res, outcome } = await invoke(getChannelVideos, {
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(Video.find).toHaveBeenCalledWith({ owner: userId });
    expect(outcome.payload.data).toEqual(docs);
  });

  it("returns empty array when no videos exist", async () => {
    Video.find.mockReturnValue({
      sort: vi.fn().mockResolvedValue([]),
    });

    const { outcome } = await invoke(getChannelVideos, {
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("json");
    expect(outcome.payload.data).toEqual([]);
  });
});
