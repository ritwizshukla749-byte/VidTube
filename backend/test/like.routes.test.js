import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const middlewareState = {
  user: { _id: "64b64c1f0000000000000001" },
};

vi.mock("../src/controllers/like.controllers.js", () => ({
  toggleVideoLike: vi.fn((req, res) => {
    return res.status(200).json({
      route: "toggleVideoLike",
      user: req.user,
      params: req.params,
    });
  }),
  toggleCommentLike: vi.fn((req, res) => {
    return res.status(200).json({
      route: "toggleCommentLike",
      user: req.user,
      params: req.params,
    });
  }),
  toggleTweetLike: vi.fn((req, res) => {
    return res.status(200).json({
      route: "toggleTweetLike",
      user: req.user,
      params: req.params,
    });
  }),
  getLikedVideos: vi.fn((req, res) => {
    return res.status(200).json({
      route: "getLikedVideos",
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
const { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos } =
  await import("../src/controllers/like.controllers.js");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("like routes", () => {
  it("protects toggleVideoLike route", async () => {
    const response = await request(app).post(
      "/api/v1/likes/toggle/v/64b64c1f0000000000000002"
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "toggleVideoLike",
      user: middlewareState.user,
      params: { videoId: "64b64c1f0000000000000002" },
    });
    expect(toggleVideoLike).toHaveBeenCalledTimes(1);
  });

  it("protects toggleCommentLike route", async () => {
    const response = await request(app).post(
      "/api/v1/likes/toggle/c/64b64c1f0000000000000003"
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "toggleCommentLike",
      user: middlewareState.user,
      params: { commentId: "64b64c1f0000000000000003" },
    });
    expect(toggleCommentLike).toHaveBeenCalledTimes(1);
  });

  it("protects toggleTweetLike route", async () => {
    const response = await request(app).post(
      "/api/v1/likes/toggle/t/64b64c1f0000000000000004"
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "toggleTweetLike",
      user: middlewareState.user,
      params: { tweetId: "64b64c1f0000000000000004" },
    });
    expect(toggleTweetLike).toHaveBeenCalledTimes(1);
  });

  it("protects getLikedVideos route", async () => {
    const response = await request(app).get("/api/v1/likes/videos");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "getLikedVideos",
      user: middlewareState.user,
    });
    expect(getLikedVideos).toHaveBeenCalledTimes(1);
  });
});
