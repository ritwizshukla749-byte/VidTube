import { describe, expect, it, beforeEach, vi } from "vitest";
import { ApiError } from "../src/utils/ApiError.js";

vi.mock("../src/utils/cloudinary.js", () => ({
  uploadOnCloudinary: vi.fn(),
  deleteFromCloudinary: vi.fn(),
}));

vi.mock("../src/models/video.models.js", () => ({
  Video: {
    aggregate: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}));

const { getAllVideos, publishVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus } =
  await import("../src/controllers/video.controllers.js");
const { uploadOnCloudinary, deleteFromCloudinary } = await import("../src/utils/cloudinary.js");
const { Video } = await import("../src/models/video.models.js");

const ownerId = "64b64c1f0000000000000001";
const videoId = "64b64c1f0000000000000002";
const otherUserId = "64b64c1f0000000000000003";

const buildVideoDoc = (overrides = {}) => ({
  _id: videoId,
  isPublished: true,
  owner: {
    _id: ownerId,
    fullName: "Owner Name",
    username: "owner",
    avatar: "avatar.jpg",
  },
  videofilename: "https://cdn.example/video.mp4",
  thumbnail: "https://cdn.example/thumb.jpg",
  title: "Original title",
  description: "Original description",
  views: 7,
  duration: 120,
  videoPublicId: "video-public-id",
  videoResourceType: "video",
  thumbnailPublicId: "thumb-public-id",
  thumbnailResourceType: "image",
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

describe("getAllVideos", () => {
  it("builds search, sort, and pagination pipeline", async () => {
    Video.aggregate.mockResolvedValue([
      {
        videos: [{ _id: "v1" }],
        totalCount: [{ count: 1 }],
      },
    ]);

    const { res, outcome } = await invoke(getAllVideos, {
      query: {
        page: "2",
        limit: "5",
        query: "Hello.*",
        sortBy: "createdAt",
        sortType: "asc",
      },
      user: { _id: otherUserId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(Video.aggregate).toHaveBeenCalledTimes(1);

    const pipeline = Video.aggregate.mock.calls[0][0];
    expect(pipeline[0]).toMatchObject({
      $match: { isPublished: true },
    });
    expect(pipeline[1]).toMatchObject({
      $match: {
        $or: [
          { title: { $regex: "Hello\\.\\*", $options: "i" } },
          { description: { $regex: "Hello\\.\\*", $options: "i" } },
        ],
      },
    });
    expect(pipeline[4]).toMatchObject({
      $sort: { createdAt: 1 },
    });
    expect(pipeline[5]).toMatchObject({
      $facet: {
        videos: [{ $skip: 5 }, { $limit: 5 }],
      },
    });
    expect(outcome.payload.data.pagination).toMatchObject({
      totalVideos: 1,
      totalPages: 1,
      currentPage: 2,
      limit: 5,
      hasNextPage: false,
      hasPrevPage: true,
    });
  });

  it("includes drafts for the owner and rejects invalid user ids", async () => {
    Video.aggregate.mockResolvedValue([
      {
        videos: [],
        totalCount: [{ count: 0 }],
      },
    ]);

    const { outcome } = await invoke(getAllVideos, {
      query: {
        userId: "64b64c1f0000000000000001",
      },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("json");
    const pipeline = Video.aggregate.mock.calls[0][0];
    expect(pipeline[0]).toMatchObject({
      $match: {
        owner: expect.any(Object),
      },
    });
    expect(pipeline[0].$match.isPublished).toBeUndefined();

    const invalid = await invoke(getAllVideos, {
      query: { userId: "not-an-object-id" },
    });

    expect(invalid.outcome.kind).toBe("next");
    expect(invalid.outcome.err).toBeInstanceOf(ApiError);
    expect(invalid.outcome.err.statusCode).toBe(400);
  });
});

describe("publishVideo", () => {
  it("uploads both assets, stores Cloudinary metadata, and returns the created video", async () => {
    uploadOnCloudinary
      .mockResolvedValueOnce({
        url: "https://cdn.example/video.mp4",
        public_id: "video-public-id",
        resource_type: "video",
      })
      .mockResolvedValueOnce({
        url: "https://cdn.example/thumb.jpg",
        public_id: "thumb-public-id",
        resource_type: "image",
      });

    const populated = buildVideoDoc();
    Video.create.mockResolvedValue({ _id: videoId });
    Video.findById.mockReturnValue({
      populate: vi.fn().mockResolvedValue(populated),
    });

    const { res, outcome } = await invoke(publishVideo, {
      body: {
        title: "  My video  ",
        description: "  Some description  ",
        duration: "42",
        isPublished: "false",
      },
      files: {
        video: [{ path: "c:/tmp/video.mp4" }],
        thumbnail: [{ path: "c:/tmp/thumb.jpg" }],
      },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(201);
    expect(uploadOnCloudinary).toHaveBeenNthCalledWith(1, "c:/tmp/video.mp4");
    expect(uploadOnCloudinary).toHaveBeenNthCalledWith(2, "c:/tmp/thumb.jpg");
    expect(Video.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "My video",
        description: "Some description",
        duration: 42,
        isPublished: false,
        owner: ownerId,
        views: 0,
        videoPublicId: "video-public-id",
        videoResourceType: "video",
        thumbnailPublicId: "thumb-public-id",
        thumbnailResourceType: "image",
      })
    );
    expect(outcome.payload.data).toEqual(populated);
  });

  it("rejects requests missing the video file", async () => {
    const { outcome } = await invoke(publishVideo, {
      body: {
        title: "Video",
        description: "Description",
      },
      files: {
        thumbnail: [{ path: "c:/tmp/thumb.jpg" }],
      },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("rejects requests with blank title or description", async () => {
    const { outcome } = await invoke(publishVideo, {
      body: {
        title: "  ",
        description: "Description",
      },
      files: {
        video: [{ path: "c:/tmp/video.mp4" }],
        thumbnail: [{ path: "c:/tmp/thumb.jpg" }],
      },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("cleans up the uploaded video if thumbnail upload fails", async () => {
    uploadOnCloudinary
      .mockResolvedValueOnce({
        url: "https://cdn.example/video.mp4",
        public_id: "video-public-id",
        resource_type: "video",
      })
      .mockResolvedValueOnce(null);

    const { outcome } = await invoke(publishVideo, {
      body: {
        title: "Video",
        description: "Description",
      },
      files: {
        video: [{ path: "c:/tmp/video.mp4" }],
        thumbnail: [{ path: "c:/tmp/thumb.jpg" }],
      },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(500);
    expect(deleteFromCloudinary).toHaveBeenCalledWith("video-public-id", "video");
  });
});

describe("getVideoById", () => {
  it("rejects invalid video ids", async () => {
    const { outcome } = await invoke(getVideoById, {
      params: { videoId: "invalid-id" },
      user: { _id: otherUserId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(404);
  });

  it("increments views for published videos viewed by non-owners", async () => {
    Video.findById.mockReturnValue({
      populate: vi.fn().mockResolvedValue(buildVideoDoc()),
    });
    Video.findByIdAndUpdate.mockReturnValue({
      populate: vi.fn().mockResolvedValue(buildVideoDoc({ views: 8 })),
    });

    const { res, outcome } = await invoke(getVideoById, {
      params: { videoId },
      user: { _id: otherUserId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(Video.findByIdAndUpdate).toHaveBeenCalledWith(
      videoId,
      { $inc: { views: 1 } },
      { new: true }
    );
  });

  it("returns the video without incrementing views for the owner", async () => {
    Video.findById.mockReturnValue({
      populate: vi.fn().mockResolvedValue(
        buildVideoDoc({ owner: { _id: ownerId } })
      ),
    });

    const { outcome } = await invoke(getVideoById, {
      params: { videoId },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("json");
    expect(Video.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(outcome.payload.data.owner._id).toBe(ownerId);
  });

  it("rejects unpublished videos for non-owners", async () => {
    Video.findById.mockReturnValue({
      populate: vi.fn().mockResolvedValue(
        buildVideoDoc({ isPublished: false, owner: { _id: ownerId } })
      ),
    });

    const { outcome } = await invoke(getVideoById, {
      params: { videoId },
      user: { _id: otherUserId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(404);
  });
});

describe("updateVideo", () => {
  it("rejects empty titles and descriptions", async () => {
    Video.findById.mockReturnValue({
      populate: vi.fn().mockResolvedValue(buildVideoDoc()),
    });

    const { outcome } = await invoke(updateVideo, {
      params: { videoId },
      body: {
        title: "  ",
      },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("updates metadata, stores the new thumbnail metadata, and removes the old thumbnail", async () => {
    Video.findById.mockReturnValue({
      populate: vi.fn().mockResolvedValue(buildVideoDoc()),
    });
    uploadOnCloudinary.mockResolvedValue({
      url: "https://cdn.example/new-thumb.jpg",
      public_id: "new-thumb-public-id",
      resource_type: "image",
    });
    Video.findByIdAndUpdate.mockReturnValue({
      populate: vi.fn().mockResolvedValue(buildVideoDoc({ thumbnail: "https://cdn.example/new-thumb.jpg" })),
    });

    const { outcome } = await invoke(updateVideo, {
      params: { videoId },
      body: {
        title: " Updated title ",
        description: " Updated description ",
      },
      file: { path: "c:/tmp/new-thumb.jpg" },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("json");
    expect(Video.findByIdAndUpdate).toHaveBeenCalledWith(
      videoId,
      {
        $set: expect.objectContaining({
          title: "Updated title",
          description: "Updated description",
          thumbnail: "https://cdn.example/new-thumb.jpg",
          thumbnailPublicId: "new-thumb-public-id",
          thumbnailResourceType: "image",
        }),
      },
      { new: true }
    );
    expect(deleteFromCloudinary).toHaveBeenCalledWith("thumb-public-id", "image");
  });

  it("cleans up the uploaded thumbnail when the database update fails", async () => {
    Video.findById.mockReturnValue({
      populate: vi.fn().mockResolvedValue(buildVideoDoc()),
    });
    uploadOnCloudinary.mockResolvedValue({
      url: "https://cdn.example/new-thumb.jpg",
      public_id: "new-thumb-public-id",
      resource_type: "image",
    });
    Video.findByIdAndUpdate.mockRejectedValue(new Error("db failure"));

    const { outcome } = await invoke(updateVideo, {
      params: { videoId },
      body: {
        title: "Updated title",
      },
      file: { path: "c:/tmp/new-thumb.jpg" },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(500);
    expect(deleteFromCloudinary).toHaveBeenCalledWith("new-thumb-public-id", "image");
  });

  it("rejects empty update payloads", async () => {
    Video.findById.mockReturnValue({
      populate: vi.fn().mockResolvedValue(buildVideoDoc()),
    });

    const { outcome } = await invoke(updateVideo, {
      params: { videoId },
      body: {},
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });
});

describe("deleteVideo", () => {
  it("rejects non-owner deletes", async () => {
    Video.findById.mockReturnValue({
      populate: vi.fn().mockResolvedValue(
        buildVideoDoc({ owner: { _id: otherUserId } })
      ),
    });

    const { outcome } = await invoke(deleteVideo, {
      params: { videoId },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(403);
  });

  it("removes the Cloudinary assets and deletes the database record", async () => {
    Video.findById.mockReturnValue({
      populate: vi.fn().mockResolvedValue(buildVideoDoc()),
    });
    Video.findByIdAndDelete.mockResolvedValue(buildVideoDoc());

    const { res, outcome } = await invoke(deleteVideo, {
      params: { videoId },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(deleteFromCloudinary).toHaveBeenNthCalledWith(1, "video-public-id", "video");
    expect(deleteFromCloudinary).toHaveBeenNthCalledWith(2, "thumb-public-id", "image");
    expect(Video.findByIdAndDelete).toHaveBeenCalledWith(videoId);
  });
});

describe("togglePublishStatus", () => {
  it("flips publish status for the owner", async () => {
    Video.findById.mockReturnValue({
      populate: vi.fn().mockResolvedValue(buildVideoDoc({ isPublished: true })),
    });
    Video.findByIdAndUpdate.mockReturnValue({
      populate: vi.fn().mockResolvedValue(buildVideoDoc({ isPublished: false })),
    });

    const { outcome } = await invoke(togglePublishStatus, {
      params: { videoId },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("json");
    expect(Video.findByIdAndUpdate).toHaveBeenCalledWith(
      videoId,
      { $set: { isPublished: false } },
      { new: true }
    );
  });
});
