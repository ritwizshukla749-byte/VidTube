import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const middlewareState = {
  user: { _id: "64b64c1f0000000000000001" },
};

vi.mock("../src/controllers/comment.controllers.js", () => ({
  getVideoComments: vi.fn((req, res) => {
    return res.status(200).json({
      route: "getVideoComments",
      params: req.params,
      query: req.query,
    });
  }),
  addComment: vi.fn((req, res) => {
    return res.status(201).json({
      route: "addComment",
      user: req.user,
      params: req.params,
      body: req.body,
    });
  }),
  updateComment: vi.fn((req, res) => {
    return res.status(200).json({
      route: "updateComment",
      user: req.user,
      params: req.params,
      body: req.body,
    });
  }),
  deleteComment: vi.fn((req, res) => {
    return res.status(200).json({
      route: "deleteComment",
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
const { getVideoComments, addComment, updateComment, deleteComment } =
  await import("../src/controllers/comment.controllers.js");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("comment routes", () => {
  it("forwards getVideoComments (public) with videoId param and query", async () => {
    const response = await request(app)
      .get("/api/v1/comments/64b64c1f0000000000000002")
      .query({ page: "1", limit: "10" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "getVideoComments",
      params: { videoId: "64b64c1f0000000000000002" },
      query: { page: "1", limit: "10" },
    });
    expect(getVideoComments).toHaveBeenCalledTimes(1);
  });

  it("protects addComment and injects user", async () => {
    const response = await request(app)
      .post("/api/v1/comments/64b64c1f0000000000000002")
      .send({ content: "Great video!" });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      route: "addComment",
      user: middlewareState.user,
      params: { videoId: "64b64c1f0000000000000002" },
      body: { content: "Great video!" },
    });
    expect(addComment).toHaveBeenCalledTimes(1);
  });

  it("protects updateComment route", async () => {
    const response = await request(app)
      .patch("/api/v1/comments/c/64b64c1f0000000000000003")
      .send({ content: "Updated comment" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "updateComment",
      user: middlewareState.user,
      params: { commentId: "64b64c1f0000000000000003" },
      body: { content: "Updated comment" },
    });
    expect(updateComment).toHaveBeenCalledTimes(1);
  });

  it("protects deleteComment route", async () => {
    const response = await request(app).delete(
      "/api/v1/comments/c/64b64c1f0000000000000003"
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "deleteComment",
      user: middlewareState.user,
      params: { commentId: "64b64c1f0000000000000003" },
    });
    expect(deleteComment).toHaveBeenCalledTimes(1);
  });
});
