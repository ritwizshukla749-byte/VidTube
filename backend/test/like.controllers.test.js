import { describe, expect, it, beforeEach, vi } from "vitest";
import { ApiError } from "../src/utils/ApiError.js";

vi.mock("../src/models/like.models.js", () => ({
  Like: {
    findOne: vi.fn(),
    deleteOne: vi.fn(),
    create: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock("../src/models/video.models.js", () => ({
  Video: { findById: vi.fn() },
}));

vi.mock("../src/models/comment.models.js", () => ({
  Comment: { findById: vi.fn() },
}));

vi.mock("../src/models/tweet.models.js", () => ({
  Tweet: { findById: vi.fn() },
}));

const {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getLikedVideos,
} = await import("../src/controllers/like.controllers.js");
const { Like } = await import("../src/models/like.models.js");
const { Video } = await import("../src/models/video.models.js");
const { Comment } = await import("../src/models/comment.models.js");
const { Tweet } = await import("../src/models/tweet.models.js");

const userId = "64b64c1f0000000000000001";
const videoId = "64b64c1f0000000000000002";
const commentId = "64b64c1f0000000000000003";
const tweetId = "64b64c1f0000000000000004";

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

describe("toggleVideoLike", () => {
  it("rejects invalid videoId", async () => {
    const { outcome } = await invoke(toggleVideoLike, {
      params: { videoId: "bad" },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("returns 404 if video not found", async () => {
    Video.findById.mockResolvedValue(null);

    const { outcome } = await invoke(toggleVideoLike, {
      params: { videoId },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(404);
  });

  it("unlikes if already liked", async () => {
    Video.findById.mockResolvedValue({ _id: videoId });
    Like.findOne.mockResolvedValue({ _id: "existing-like" });

    const { res, outcome } = await invoke(toggleVideoLike, {
      params: { videoId },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(Like.deleteOne).toHaveBeenCalledWith({ _id: "existing-like" });
  });

  it("likes if not already liked", async () => {
    Video.findById.mockResolvedValue({ _id: videoId });
    Like.findOne.mockResolvedValue(null);

    const { res, outcome } = await invoke(toggleVideoLike, {
      params: { videoId },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(Like.create).toHaveBeenCalledWith({
      video: videoId,
      likedBy: userId,
    });
  });
});

describe("toggleCommentLike", () => {
  it("rejects invalid commentId", async () => {
    const { outcome } = await invoke(toggleCommentLike, {
      params: { commentId: "bad" },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("returns 404 if comment not found", async () => {
    Comment.findById.mockResolvedValue(null);

    const { outcome } = await invoke(toggleCommentLike, {
      params: { commentId },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(404);
  });

  it("unlikes if already liked", async () => {
    Comment.findById.mockResolvedValue({ _id: commentId });
    Like.findOne.mockResolvedValue({ _id: "existing-like" });

    const { outcome } = await invoke(toggleCommentLike, {
      params: { commentId },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("json");
    expect(Like.deleteOne).toHaveBeenCalled();
  });

  it("likes if not already liked", async () => {
    Comment.findById.mockResolvedValue({ _id: commentId });
    Like.findOne.mockResolvedValue(null);

    const { outcome } = await invoke(toggleCommentLike, {
      params: { commentId },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("json");
    expect(Like.create).toHaveBeenCalledWith({
      comment: commentId,
      likedBy: userId,
    });
  });
});

describe("toggleTweetLike", () => {
  it("rejects invalid tweetId", async () => {
    const { outcome } = await invoke(toggleTweetLike, {
      params: { tweetId: "bad" },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("returns 404 if tweet not found", async () => {
    Tweet.findById.mockResolvedValue(null);

    const { outcome } = await invoke(toggleTweetLike, {
      params: { tweetId },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(404);
  });

  it("unlikes if already liked", async () => {
    Tweet.findById.mockResolvedValue({ _id: tweetId });
    Like.findOne.mockResolvedValue({ _id: "existing-like" });

    const { outcome } = await invoke(toggleTweetLike, {
      params: { tweetId },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("json");
    expect(Like.deleteOne).toHaveBeenCalled();
  });

  it("likes if not already liked", async () => {
    Tweet.findById.mockResolvedValue({ _id: tweetId });
    Like.findOne.mockResolvedValue(null);

    const { outcome } = await invoke(toggleTweetLike, {
      params: { tweetId },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("json");
    expect(Like.create).toHaveBeenCalledWith({
      tweet: tweetId,
      likedBy: userId,
    });
  });
});

describe("getLikedVideos", () => {
  it("returns liked videos populated", async () => {
    const docs = [
      { _id: "l1", video: { title: "Video 1" } },
    ];
    Like.find.mockReturnValue({
      populate: vi.fn().mockResolvedValue(docs),
    });

    const { res, outcome } = await invoke(getLikedVideos, {
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(Like.find).toHaveBeenCalledWith({
      likedBy: userId,
      video: { $ne: null, $exists: true },
    });
    expect(outcome.payload.data).toEqual(docs);
  });
});
