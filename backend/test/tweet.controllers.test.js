import { describe, expect, it, beforeEach, vi } from "vitest";
import { ApiError } from "../src/utils/ApiError.js";

vi.mock("../src/models/tweet.models.js", () => ({
  Tweet: {
    create: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}));

vi.mock("../src/models/user.models.js", () => ({
  User: { findById: vi.fn() },
}));

const {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
} = await import("../src/controllers/tweet.controllers.js");
const { Tweet } = await import("../src/models/tweet.models.js");
const { User } = await import("../src/models/user.models.js");

const ownerId = "64b64c1f0000000000000001";
const tweetId = "64b64c1f0000000000000002";
const otherUserId = "64b64c1f0000000000000003";

const buildTweetDoc = (overrides = {}) => ({
  _id: tweetId,
  content: "Test tweet content",
  owner: ownerId,
  save: vi.fn().mockResolvedValue(true),
  ...overrides,
});

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

describe("createTweet", () => {
  it("rejects missing content", async () => {
    const { outcome } = await invoke(createTweet, {
      body: {},
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("rejects blank content", async () => {
    const { outcome } = await invoke(createTweet, {
      body: { content: "  " },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("trims content before saving", async () => {
    Tweet.create.mockResolvedValue(buildTweetDoc());

    const { outcome } = await invoke(createTweet, {
      body: { content: "  Hello World  " },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("json");
    expect(Tweet.create).toHaveBeenCalledWith(
      expect.objectContaining({
        content: "Hello World",
        owner: ownerId,
      })
    );
  });

  it("returns 201 on success", async () => {
    const doc = buildTweetDoc();
    Tweet.create.mockResolvedValue(doc);

    const { res, outcome } = await invoke(createTweet, {
      body: { content: "My tweet" },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(201);
    expect(outcome.payload.data).toEqual(doc);
  });
});

describe("getUserTweets", () => {
  it("rejects invalid userId", async () => {
    const { outcome } = await invoke(getUserTweets, {
      params: { userId: "invalid" },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("returns 404 if user not found", async () => {
    User.findById.mockResolvedValue(null);

    const { outcome } = await invoke(getUserTweets, {
      params: { userId: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(404);
  });

  it("returns tweets sorted by createdAt desc", async () => {
    const docs = [buildTweetDoc()];
    User.findById.mockResolvedValue({ _id: ownerId });
    Tweet.find.mockReturnValue({
      sort: vi.fn().mockResolvedValue(docs),
    });

    const { res, outcome } = await invoke(getUserTweets, {
      params: { userId: ownerId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(outcome.payload.data).toEqual(docs);
  });
});

describe("updateTweet", () => {
  it("rejects invalid tweetId", async () => {
    const { outcome } = await invoke(updateTweet, {
      params: { tweetId: "bad" },
      body: {},
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("rejects empty content", async () => {
    const { outcome } = await invoke(updateTweet, {
      params: { tweetId },
      body: { content: "  " },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("returns 404 if tweet not found", async () => {
    Tweet.findById.mockResolvedValue(null);

    const { outcome } = await invoke(updateTweet, {
      params: { tweetId },
      body: { content: "Updated" },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(404);
  });

  it("returns 403 if user is not the owner", async () => {
    Tweet.findById.mockResolvedValue(buildTweetDoc({ owner: otherUserId }));

    const { outcome } = await invoke(updateTweet, {
      params: { tweetId },
      body: { content: "Updated" },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(403);
  });

  it("updates and trims content on success", async () => {
    const saveMock = vi.fn().mockResolvedValue(true);
    Tweet.findById.mockResolvedValue(
      buildTweetDoc({ save: saveMock })
    );

    const { res, outcome } = await invoke(updateTweet, {
      params: { tweetId },
      body: { content: "  Updated content  " },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(outcome.payload.data.content).toBe("Updated content");
    expect(saveMock).toHaveBeenCalled();
  });
});

describe("deleteTweet", () => {
  it("rejects invalid tweetId", async () => {
    const { outcome } = await invoke(deleteTweet, {
      params: { tweetId: "bad" },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("returns 404 if tweet not found", async () => {
    Tweet.findById.mockResolvedValue(null);

    const { outcome } = await invoke(deleteTweet, {
      params: { tweetId },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(404);
  });

  it("returns 403 if user is not the owner", async () => {
    Tweet.findById.mockResolvedValue(buildTweetDoc({ owner: otherUserId }));

    const { outcome } = await invoke(deleteTweet, {
      params: { tweetId },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(403);
  });

  it("deletes tweet and returns 200 on success", async () => {
    Tweet.findById.mockResolvedValue(buildTweetDoc());
    Tweet.findByIdAndDelete.mockResolvedValue({ _id: tweetId });

    const { res, outcome } = await invoke(deleteTweet, {
      params: { tweetId },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(Tweet.findByIdAndDelete).toHaveBeenCalledWith(tweetId);
  });
});
