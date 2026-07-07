import { describe, expect, it, beforeEach, vi } from "vitest";
import { ApiError } from "../src/utils/ApiError.js";

vi.mock("../src/models/playlist.models.js", () => ({
  Playlist: {
    create: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}));

vi.mock("../src/models/video.models.js", () => ({
  Video: { findById: vi.fn() },
}));

const {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} = await import("../src/controllers/playlist.controllers.js");
const { Playlist } = await import("../src/models/playlist.models.js");
const { Video } = await import("../src/models/video.models.js");

const ownerId = "64b64c1f0000000000000001";
const playlistId = "64b64c1f0000000000000002";
const videoId = "64b64c1f0000000000000003";
const otherUserId = "64b64c1f0000000000000004";

const buildPlaylistDoc = (overrides = {}) => ({
  _id: playlistId,
  name: "Test Playlist",
  description: "Test Description",
  owner: ownerId,
  videos: [],
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

describe("createPlaylist", () => {
  it("rejects missing name", async () => {
    const { outcome } = await invoke(createPlaylist, {
      body: { description: "desc" },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("rejects blank name", async () => {
    const { outcome } = await invoke(createPlaylist, {
      body: { name: "  ", description: "desc" },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("rejects missing description", async () => {
    const { outcome } = await invoke(createPlaylist, {
      body: { name: "My List" },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("rejects blank description", async () => {
    const { outcome } = await invoke(createPlaylist, {
      body: { name: "My List", description: "  " },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("trims name and description before saving", async () => {
    Playlist.create.mockResolvedValue(buildPlaylistDoc());

    const { outcome } = await invoke(createPlaylist, {
      body: { name: "  My List  ", description: "  My Desc  " },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("json");
    expect(Playlist.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "My List",
        description: "My Desc",
        owner: ownerId,
      })
    );
  });

  it("returns 201 on success", async () => {
    const doc = buildPlaylistDoc();
    Playlist.create.mockResolvedValue(doc);

    const { res, outcome } = await invoke(createPlaylist, {
      body: { name: "My List", description: "My Desc" },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe("getUserPlaylists", () => {
  it("rejects invalid userId", async () => {
    const { outcome } = await invoke(getUserPlaylists, {
      params: { userId: "invalid" },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("returns playlists for the specified user", async () => {
    const docs = [buildPlaylistDoc()];
    Playlist.find.mockResolvedValue(docs);

    const { res, outcome } = await invoke(getUserPlaylists, {
      params: { userId: ownerId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(Playlist.find).toHaveBeenCalledWith({ owner: ownerId });
    expect(outcome.payload.data).toEqual(docs);
  });
});

describe("getPlaylistById", () => {
  it("rejects invalid playlistId", async () => {
    const { outcome } = await invoke(getPlaylistById, {
      params: { playlistId: "bad-id" },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("returns 404 if playlist not found", async () => {
    Playlist.findById.mockReturnValue({
      populate: vi.fn().mockResolvedValue(null),
    });

    const { outcome } = await invoke(getPlaylistById, {
      params: { playlistId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(404);
  });

  it("returns populated playlist on success", async () => {
    const doc = buildPlaylistDoc({ videos: [{ _id: videoId }] });
    Playlist.findById.mockReturnValue({
      populate: vi.fn().mockResolvedValue(doc),
    });

    const { res, outcome } = await invoke(getPlaylistById, {
      params: { playlistId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(outcome.payload.data).toEqual(doc);
  });
});

describe("addVideoToPlaylist", () => {
  it("rejects invalid ids", async () => {
    const { outcome } = await invoke(addVideoToPlaylist, {
      params: { playlistId: "bad", videoId: "bad" },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("returns 404 if playlist not found", async () => {
    Playlist.findById.mockResolvedValue(null);

    const { outcome } = await invoke(addVideoToPlaylist, {
      params: { playlistId, videoId },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(404);
  });

  it("returns 403 if user is not the owner", async () => {
    Playlist.findById.mockResolvedValue(buildPlaylistDoc({ owner: otherUserId }));

    const { outcome } = await invoke(addVideoToPlaylist, {
      params: { playlistId, videoId },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(403);
  });

  it("returns 404 if video not found", async () => {
    Playlist.findById.mockResolvedValue(buildPlaylistDoc());
    Video.findById.mockResolvedValue(null);

    const { outcome } = await invoke(addVideoToPlaylist, {
      params: { playlistId, videoId },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(404);
  });

  it("returns 400 if video already exists in playlist", async () => {
    Playlist.findById.mockResolvedValue(
      buildPlaylistDoc({ videos: [videoId] })
    );
    Video.findById.mockResolvedValue({ _id: videoId });

    const { outcome } = await invoke(addVideoToPlaylist, {
      params: { playlistId, videoId },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("adds video and returns 200 on success", async () => {
    const saveMock = vi.fn().mockResolvedValue(true);
    Playlist.findById.mockResolvedValue(
      buildPlaylistDoc({ videos: [], save: saveMock })
    );
    Video.findById.mockResolvedValue({ _id: videoId });

    const { res, outcome } = await invoke(addVideoToPlaylist, {
      params: { playlistId, videoId },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(saveMock).toHaveBeenCalled();
  });
});

describe("removeVideoFromPlaylist", () => {
  it("rejects invalid ids", async () => {
    const { outcome } = await invoke(removeVideoFromPlaylist, {
      params: { playlistId: "bad", videoId: "bad" },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("returns 404 if playlist not found", async () => {
    Playlist.findById.mockResolvedValue(null);

    const { outcome } = await invoke(removeVideoFromPlaylist, {
      params: { playlistId, videoId },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(404);
  });

  it("returns 403 if user is not the owner", async () => {
    Playlist.findById.mockResolvedValue(buildPlaylistDoc({ owner: otherUserId }));

    const { outcome } = await invoke(removeVideoFromPlaylist, {
      params: { playlistId, videoId },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(403);
  });

  it("returns 400 if video is not in the playlist", async () => {
    Playlist.findById.mockResolvedValue(buildPlaylistDoc({ videos: [] }));

    const { outcome } = await invoke(removeVideoFromPlaylist, {
      params: { playlistId, videoId },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("removes video and returns 200 on success", async () => {
    const pullSpy = vi.fn();
    const saveMock = vi.fn().mockResolvedValue(true);
    Playlist.findById.mockResolvedValue(
      buildPlaylistDoc({
        videos: new Proxy([videoId], {
          get(target, prop) {
            if (prop === "pull") return pullSpy;
            return target[prop];
          },
        }),
        save: saveMock,
      })
    );

    const { res, outcome } = await invoke(removeVideoFromPlaylist, {
      params: { playlistId, videoId },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(pullSpy).toHaveBeenCalledWith(videoId);
    expect(saveMock).toHaveBeenCalled();
  });
});

describe("deletePlaylist", () => {
  it("rejects invalid playlistId", async () => {
    const { outcome } = await invoke(deletePlaylist, {
      params: { playlistId: "bad" },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("returns 404 if playlist not found", async () => {
    Playlist.findById.mockResolvedValue(null);

    const { outcome } = await invoke(deletePlaylist, {
      params: { playlistId },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(404);
  });

  it("returns 403 if user is not the owner", async () => {
    Playlist.findById.mockResolvedValue(buildPlaylistDoc({ owner: otherUserId }));

    const { outcome } = await invoke(deletePlaylist, {
      params: { playlistId },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(403);
  });

  it("deletes playlist and returns 200 on success", async () => {
    Playlist.findById.mockResolvedValue(buildPlaylistDoc());
    Playlist.findByIdAndDelete.mockResolvedValue({ _id: playlistId });

    const { res, outcome } = await invoke(deletePlaylist, {
      params: { playlistId },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(Playlist.findByIdAndDelete).toHaveBeenCalledWith(playlistId);
  });
});

describe("updatePlaylist", () => {
  it("rejects invalid playlistId", async () => {
    const { outcome } = await invoke(updatePlaylist, {
      params: { playlistId: "bad" },
      body: {},
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("returns 404 if playlist not found", async () => {
    Playlist.findById.mockResolvedValue(null);

    const { outcome } = await invoke(updatePlaylist, {
      params: { playlistId },
      body: {},
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(404);
  });

  it("returns 403 if user is not the owner", async () => {
    Playlist.findById.mockResolvedValue(buildPlaylistDoc({ owner: otherUserId }));

    const { outcome } = await invoke(updatePlaylist, {
      params: { playlistId },
      body: {},
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(403);
  });

  it("updates name and trims it", async () => {
    const saveMock = vi.fn().mockResolvedValue(true);
    Playlist.findById.mockResolvedValue(
      buildPlaylistDoc({ name: "Old Name", save: saveMock })
    );

    const { res, outcome } = await invoke(updatePlaylist, {
      params: { playlistId },
      body: { name: "  New Name  " },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(outcome.payload.data.name).toBe("New Name");
    expect(saveMock).toHaveBeenCalled();
  });

  it("updates description and trims it", async () => {
    const saveMock = vi.fn().mockResolvedValue(true);
    Playlist.findById.mockResolvedValue(
      buildPlaylistDoc({ description: "Old Desc", save: saveMock })
    );

    const { outcome } = await invoke(updatePlaylist, {
      params: { playlistId },
      body: { description: "  New Desc  " },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("json");
    expect(outcome.payload.data.description).toBe("New Desc");
  });

  it("clears name when empty string is sent", async () => {
    const saveMock = vi.fn().mockResolvedValue(true);
    Playlist.findById.mockResolvedValue(
      buildPlaylistDoc({ save: saveMock })
    );

    const { outcome } = await invoke(updatePlaylist, {
      params: { playlistId },
      body: { name: "" },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("json");
    expect(outcome.payload.data.name).toBe("");
    expect(saveMock).toHaveBeenCalled();
  });

  it("clears description when empty string is sent", async () => {
    const saveMock = vi.fn().mockResolvedValue(true);
    Playlist.findById.mockResolvedValue(
      buildPlaylistDoc({ save: saveMock })
    );

    const { outcome } = await invoke(updatePlaylist, {
      params: { playlistId },
      body: { description: "" },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("json");
    expect(outcome.payload.data.description).toBe("");
  });

  it("ignores fields not present in body", async () => {
    const saveMock = vi.fn().mockResolvedValue(true);
    Playlist.findById.mockResolvedValue(
      buildPlaylistDoc({ save: saveMock })
    );

    const { outcome } = await invoke(updatePlaylist, {
      params: { playlistId },
      body: {},
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("json");
    expect(outcome.payload.data.name).toBe("Test Playlist");
    expect(outcome.payload.data.description).toBe("Test Description");
  });

  it("updates both name and description together", async () => {
    const saveMock = vi.fn().mockResolvedValue(true);
    Playlist.findById.mockResolvedValue(
      buildPlaylistDoc({ save: saveMock })
    );

    const { outcome } = await invoke(updatePlaylist, {
      params: { playlistId },
      body: { name: "New Name", description: "New Desc" },
      user: { _id: ownerId },
    });

    expect(outcome.kind).toBe("json");
    expect(outcome.payload.data.name).toBe("New Name");
    expect(outcome.payload.data.description).toBe("New Desc");
  });
});
