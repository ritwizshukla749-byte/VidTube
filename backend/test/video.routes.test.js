import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const middlewareState = {
  user: { _id: "64b64c1f0000000000000001" },
  files: {
    video: [{ path: "c:/tmp/video.mp4" }],
    thumbnail: [{ path: "c:/tmp/thumb.jpg" }],
  },
  file: { path: "c:/tmp/new-thumb.jpg" },
};

vi.mock("../src/controllers/video.controllers.js", () => ({
  getAllVideos: vi.fn((req, res) => {
    return res.status(200).json({
      route: "getAllVideos",
      query: req.query,
    });
  }),
  publishVideo: vi.fn((req, res) => {
    return res.status(201).json({
      route: "publishVideo",
      user: req.user,
      body: req.body,
      files: req.files,
    });
  }),
  getVideoById: vi.fn((req, res) => {
    return res.status(200).json({
      route: "getVideoById",
      params: req.params,
    });
  }),
  updateVideo: vi.fn((req, res) => {
    return res.status(200).json({
      route: "updateVideo",
      user: req.user,
      params: req.params,
      body: req.body,
      file: req.file,
    });
  }),
  deleteVideo: vi.fn((req, res) => {
    return res.status(200).json({
      route: "deleteVideo",
      user: req.user,
      params: req.params,
    });
  }),
  togglePublishStatus: vi.fn((req, res) => {
    return res.status(200).json({
      route: "togglePublishStatus",
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
  optionalVerifyJWT: vi.fn((req, _res, next) => {
    // optional auth should simply continue without modifying the request
    next();
  }),
}));

vi.mock("../src/middlewares/multer.middlewares.js", () => ({
  upload: {
    fields: vi.fn(() => (req, _res, next) => {
      req.files = middlewareState.files;
      next();
    }),
    single: vi.fn(() => (req, _res, next) => {
      req.file = middlewareState.file;
      next();
    }),
  },
}));

const { app } = await import("../src/app.js");
const { getAllVideos, publishVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus } =
  await import("../src/controllers/video.controllers.js");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("video routes", () => {
  it("forwards video listing requests to getAllVideos", async () => {
    const response = await request(app)
      .get("/api/v1/videos")
      .query({ query: "test", sortBy: "views" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "getAllVideos",
      query: { query: "test", sortBy: "views" },
    });
    expect(getAllVideos).toHaveBeenCalledTimes(1);
  });

  it("protects the publish route and injects uploaded files", async () => {
    const response = await request(app)
      .post("/api/v1/videos")
      .send({ title: "Route title", description: "Route description" });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      route: "publishVideo",
      user: middlewareState.user,
      body: { title: "Route title", description: "Route description" },
      files: middlewareState.files,
    });
    expect(publishVideo).toHaveBeenCalledTimes(1);
  });

  it("forwards single video lookups to getVideoById", async () => {
    const response = await request(app).get(`/api/v1/videos/64b64c1f0000000000000002`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "getVideoById",
      params: { videoId: "64b64c1f0000000000000002" },
    });
    expect(getVideoById).toHaveBeenCalledTimes(1);
  });

  it("protects the update route and injects the thumbnail file", async () => {
    const response = await request(app)
      .patch(`/api/v1/videos/64b64c1f0000000000000002`)
      .send({ title: "Updated title" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "updateVideo",
      user: middlewareState.user,
      params: { videoId: "64b64c1f0000000000000002" },
      body: { title: "Updated title" },
      file: middlewareState.file,
    });
    expect(updateVideo).toHaveBeenCalledTimes(1);
  });

  it("protects the delete route", async () => {
    const response = await request(app).delete(`/api/v1/videos/64b64c1f0000000000000002`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "deleteVideo",
      user: middlewareState.user,
      params: { videoId: "64b64c1f0000000000000002" },
    });
    expect(deleteVideo).toHaveBeenCalledTimes(1);
  });

  it("protects the publish-status route", async () => {
    const response = await request(app)
      .patch(`/api/v1/videos/64b64c1f0000000000000002/publish-status`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "togglePublishStatus",
      user: middlewareState.user,
      params: { videoId: "64b64c1f0000000000000002" },
    });
    expect(togglePublishStatus).toHaveBeenCalledTimes(1);
  });
});
