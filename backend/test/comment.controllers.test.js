import { describe, expect, it, beforeEach, vi } from "vitest";
import { ApiError } from "../src/utils/ApiError.js";

const mockAggregate = vi.fn();

vi.mock("../src/models/comment.models.js", () => ({
  Comment: {
    aggregate: vi.fn(() => mockAggregate()),
    aggregatePaginate: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}));

vi.mock("../src/models/video.models.js", () => ({
  Video: { findById: vi.fn() },
}));

const {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} = await import("../src/controllers/comment.controllers.js");
const { Comment } = await import("../src/models/comment.models.js");
const { Video } = await import("../src/models/video.models.js");

const userId = "64b64c1f0000000000000001";
const videoId = "64b64c1f0000000000000002";
const commentId = "64b64c1f0000000000000003";
const otherUserId = "64b64c1f0000000000000004";

const buildCommentDoc = (overrides = {}) => ({
  _id: commentId,
  content: "Test comment",
  video: videoId,
  owner: userId,
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

describe("getVideoComments", () => {
  it("rejects invalid videoId", async () => {
    const { outcome } = await invoke(getVideoComments, {
      params: { videoId: "bad" },
      query: {},
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("returns paginated comments", async () => {
    const paginatedResult = {
      docs: [{ _id: commentId, content: "Nice video" }],
      totalDocs: 1,
      page: 1,
      limit: 10,
    };
    Comment.aggregatePaginate.mockResolvedValue(paginatedResult);

    const { res, outcome } = await invoke(getVideoComments, {
      params: { videoId },
      query: { page: "1", limit: "10" },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(outcome.payload.data).toEqual(paginatedResult);
  });
});

describe("addComment", () => {
  it("rejects invalid videoId", async () => {
    const { outcome } = await invoke(addComment, {
      params: { videoId: "bad" },
      body: {},
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("rejects empty content", async () => {
    const { outcome } = await invoke(addComment, {
      params: { videoId },
      body: { content: "  " },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("returns 404 if video not found", async () => {
    Video.findById.mockResolvedValue(null);

    const { outcome } = await invoke(addComment, {
      params: { videoId },
      body: { content: "Great video" },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(404);
  });

  it("creates comment and returns 201", async () => {
    Video.findById.mockResolvedValue({ _id: videoId });
    const doc = buildCommentDoc();
    Comment.create.mockResolvedValue(doc);

    const { res, outcome } = await invoke(addComment, {
      params: { videoId },
      body: { content: "Great video" },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(201);
    expect(Comment.create).toHaveBeenCalledWith({
      video: videoId,
      content: "Great video",
      owner: userId,
    });
    expect(outcome.payload.data).toEqual(doc);
  });
});

describe("updateComment", () => {
  it("rejects invalid commentId", async () => {
    const { outcome } = await invoke(updateComment, {
      params: { commentId: "bad" },
      body: {},
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("rejects empty content", async () => {
    const { outcome } = await invoke(updateComment, {
      params: { commentId },
      body: { content: "  " },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("returns 404 if comment not found", async () => {
    Comment.findById.mockResolvedValue(null);

    const { outcome } = await invoke(updateComment, {
      params: { commentId },
      body: { content: "Updated" },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(404);
  });

  it("returns 403 if user is not the owner", async () => {
    Comment.findById.mockResolvedValue(buildCommentDoc({ owner: otherUserId }));

    const { outcome } = await invoke(updateComment, {
      params: { commentId },
      body: { content: "Updated" },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(403);
  });

  it("updates comment content on success", async () => {
    const saveMock = vi.fn().mockResolvedValue(true);
    Comment.findById.mockResolvedValue(
      buildCommentDoc({ save: saveMock })
    );

    const { res, outcome } = await invoke(updateComment, {
      params: { commentId },
      body: { content: "Updated content" },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(saveMock).toHaveBeenCalled();
  });
});

describe("deleteComment", () => {
  it("rejects invalid commentId", async () => {
    const { outcome } = await invoke(deleteComment, {
      params: { commentId: "bad" },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("returns 404 if comment not found", async () => {
    Comment.findById.mockResolvedValue(null);

    const { outcome } = await invoke(deleteComment, {
      params: { commentId },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(404);
  });

  it("returns 403 if user is not the owner", async () => {
    Comment.findById.mockResolvedValue(buildCommentDoc({ owner: otherUserId }));

    const { outcome } = await invoke(deleteComment, {
      params: { commentId },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(403);
  });

  it("deletes comment and returns 200 on success", async () => {
    Comment.findById.mockResolvedValue(buildCommentDoc());
    Comment.findByIdAndDelete.mockResolvedValue({ _id: commentId });

    const { res, outcome } = await invoke(deleteComment, {
      params: { commentId },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(Comment.findByIdAndDelete).toHaveBeenCalledWith(commentId);
  });
});
