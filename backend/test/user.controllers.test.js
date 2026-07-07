import { describe, expect, it, beforeEach, vi } from "vitest";
import { ApiError } from "../src/utils/ApiError.js";

const mockJwtVerify = vi.fn();

vi.mock("jsonwebtoken", () => ({
  default: { verify: (...args) => mockJwtVerify(...args) },
}));

vi.mock("../src/utils/cloudinary.js", () => ({
  uploadOnCloudinary: vi.fn(),
  deleteFromCloudinary: vi.fn(),
}));

const mockUserFindById = vi.fn();
const mockUserFindOne = vi.fn();
const mockUserFindByIdAndUpdate = vi.fn();
const mockUserAggregate = vi.fn();
const mockUserCreate = vi.fn();

const buildFindByIdReturn = (userDoc) => {
  const promise = Promise.resolve(userDoc);
  promise.select = vi.fn().mockResolvedValue(userDoc);
  return promise;
};

vi.mock("../src/models/user.models.js", () => ({
  User: {
    findById: (...args) => mockUserFindById(...args),
    findOne: (...args) => mockUserFindOne(...args),
    findByIdAndUpdate: (...args) => mockUserFindByIdAndUpdate(...args),
    aggregate: (...args) => mockUserAggregate(...args),
    create: (...args) => mockUserCreate(...args),
  },
}));

const {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
} = await import("../src/controllers/user.controllers.js");
const { User } = await import("../src/models/user.models.js");
const { uploadOnCloudinary, deleteFromCloudinary } = await import(
  "../src/utils/cloudinary.js"
);

const userId = "64b64c1f0000000000000001";

const buildUserDoc = (overrides = {}) => ({
  _id: userId,
  username: "testuser",
  email: "test@example.com",
  fullName: "Test User",
  avatar: "https://cloudinary.com/avatar.jpg",
  coverImage: "https://cloudinary.com/cover.jpg",
  password: "hashedpassword",
  refreshToken: "valid-refresh-token",
  isPasswordCorrect: vi.fn(),
  generateAccessToken: vi.fn().mockReturnValue("access-token"),
  generateRefreshToken: vi.fn().mockReturnValue("refresh-token"),
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
    cookie: vi.fn().mockReturnThis(),
    clearCookie: vi.fn().mockReturnThis(),
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

describe("registerUser", () => {
  it("rejects missing fields", async () => {
    const { outcome } = await invoke(registerUser, { body: {} });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("rejects existing username or email", async () => {
    mockUserFindOne.mockResolvedValue({ _id: "existing" });

    const { outcome } = await invoke(registerUser, {
      body: {
        fullName: "Test",
        username: "existing",
        email: "existing@test.com",
        password: "password123",
      },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("rejects missing avatar file", async () => {
    mockUserFindOne.mockResolvedValue(null);

    const { outcome } = await invoke(registerUser, {
      body: {
        fullName: "Test",
        username: "newuser",
        email: "new@test.com",
        password: "password123",
      },
      files: {},
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("creates user and returns 201 on success", async () => {
    mockUserFindOne.mockResolvedValue(null);
    uploadOnCloudinary
      .mockResolvedValueOnce({ url: "https://cloudinary.com/avatar.jpg", public_id: "avatar_pid" })
      .mockResolvedValueOnce({ url: "https://cloudinary.com/cover.jpg", public_id: "cover_pid" });

    const createdDoc = buildUserDoc();
    mockUserCreate.mockResolvedValue(createdDoc);

    const selectedUser = { ...createdDoc, password: undefined, refreshToken: undefined };
    mockUserFindById.mockReturnValue(buildFindByIdReturn(selectedUser));

    const { res, outcome } = await invoke(registerUser, {
      body: {
        fullName: "Test User",
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      },
      files: {
        avatar: [{ path: "/tmp/avatar.jpg" }],
        coverImage: [{ path: "/tmp/cover.jpg" }],
      },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(201);
    expect(outcome.payload.data).toEqual(selectedUser);
  });
});

describe("loginUser", () => {
  it("rejects missing email", async () => {
    const { outcome } = await invoke(loginUser, {
      body: { password: "pass" },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("returns 404 if user not found", async () => {
    mockUserFindOne.mockResolvedValue(null);

    const { outcome } = await invoke(loginUser, {
      body: { email: "none@test.com", password: "pass" },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(404);
  });

  it("returns 401 if password is wrong", async () => {
    const userDoc = buildUserDoc();
    userDoc.isPasswordCorrect.mockResolvedValue(false);
    mockUserFindOne.mockResolvedValue(userDoc);

    const { outcome } = await invoke(loginUser, {
      body: { email: "test@test.com", password: "wrong" },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(401);
  });

  it("returns 200 with tokens on success", async () => {
    const userDoc = buildUserDoc();
    userDoc.isPasswordCorrect.mockResolvedValue(true);
    mockUserFindOne.mockResolvedValue(userDoc);

    const loggedInUser = { ...userDoc, password: undefined, refreshToken: undefined };
    mockUserFindById.mockReturnValue(buildFindByIdReturn(loggedInUser));

    const { res, outcome } = await invoke(loginUser, {
      body: { email: "test@test.com", password: "correct" },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(outcome.payload.data.user).toEqual(loggedInUser);
    expect(outcome.payload.data.accessToken).toBe("access-token");
  });
});

describe("logoutUser", () => {
  it("clears refresh token and cookies", async () => {
    mockUserFindByIdAndUpdate.mockResolvedValue({ _id: userId });

    const { res, outcome } = await invoke(logoutUser, {
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockUserFindByIdAndUpdate).toHaveBeenCalledWith(
      userId,
      { $set: { refreshToken: undefined } },
      { new: true }
    );
    expect(res.clearCookie).toHaveBeenCalled();
  });
});

describe("refreshAccessToken", () => {
  it("rejects missing refresh token", async () => {
    const { outcome } = await invoke(refreshAccessToken, {
      cookies: {},
      body: {},
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(401);
  });

  it("returns 500 if jwt verify fails", async () => {
    mockJwtVerify.mockImplementation(() => {
      throw new Error("jwt expired");
    });

    const { outcome } = await invoke(refreshAccessToken, {
      cookies: { refreshToken: "expired-token" },
      body: {},
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(500);
  });

  it("returns new tokens on success", async () => {
    mockJwtVerify.mockReturnValue({ userId });
    const userDoc = buildUserDoc();
    mockUserFindById.mockReturnValue(buildFindByIdReturn(userDoc));

    const { res, outcome } = await invoke(refreshAccessToken, {
      cookies: { refreshToken: "valid-refresh-token" },
      body: {},
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(outcome.payload.data.accessToken).toBe("access-token");
  });
});

describe("changeCurrentPassword", () => {
  it("returns 401 if old password is incorrect", async () => {
    const userDoc = buildUserDoc();
    userDoc.isPasswordCorrect.mockResolvedValue(false);
    mockUserFindById.mockReturnValue(buildFindByIdReturn(userDoc));

    const { outcome } = await invoke(changeCurrentPassword, {
      body: { oldPassword: "wrong", newPassword: "newpass" },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(401);
  });

  it("updates password on success", async () => {
    const saveMock = vi.fn().mockResolvedValue(true);
    const userDoc = buildUserDoc({ save: saveMock });
    userDoc.isPasswordCorrect.mockResolvedValue(true);
    mockUserFindById.mockReturnValue(buildFindByIdReturn(userDoc));

    const { res, outcome } = await invoke(changeCurrentPassword, {
      body: { oldPassword: "correct", newPassword: "newpass" },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(userDoc.password).toBe("newpass");
    expect(saveMock).toHaveBeenCalled();
  });
});

describe("getCurrentUser", () => {
  it("returns the current user from req.user", async () => {
    const currentUser = { _id: userId, username: "testuser" };

    const { res, outcome } = await invoke(getCurrentUser, {
      user: currentUser,
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(outcome.payload.data).toEqual(currentUser);
  });
});

describe("updateAccountDetails", () => {
  it("rejects missing fields", async () => {
    const { outcome } = await invoke(updateAccountDetails, {
      body: {},
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("updates account details on success", async () => {
    const updatedUser = { _id: userId, fullName: "New Name", email: "new@test.com" };
    mockUserFindByIdAndUpdate.mockReturnValue({
      select: vi.fn().mockResolvedValue(updatedUser),
    });

    const { res, outcome } = await invoke(updateAccountDetails, {
      body: { fullName: "New Name", email: "new@test.com" },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(outcome.payload.data).toEqual(updatedUser);
  });
});

describe("updateUserAvatar", () => {
  it("rejects missing file", async () => {
    const { outcome } = await invoke(updateUserAvatar, {
      file: undefined,
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("rejects failed upload", async () => {
    uploadOnCloudinary.mockResolvedValue({ url: null });

    const { outcome } = await invoke(updateUserAvatar, {
      file: { path: "/tmp/avatar.jpg" },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(500);
  });

  it("updates avatar on success", async () => {
    uploadOnCloudinary.mockResolvedValue({ url: "https://cloudinary.com/new-avatar.jpg" });
    const updatedUser = { _id: userId, avatar: "https://cloudinary.com/new-avatar.jpg" };
    mockUserFindByIdAndUpdate.mockReturnValue({
      select: vi.fn().mockResolvedValue(updatedUser),
    });

    const { res, outcome } = await invoke(updateUserAvatar, {
      file: { path: "/tmp/avatar.jpg" },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(outcome.payload.data).toEqual(updatedUser);
  });
});

describe("updateUserCoverImage", () => {
  it("rejects missing file", async () => {
    const { outcome } = await invoke(updateUserCoverImage, {
      file: undefined,
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("rejects failed upload", async () => {
    uploadOnCloudinary.mockResolvedValue({ url: null });

    const { outcome } = await invoke(updateUserCoverImage, {
      file: { path: "/tmp/cover.jpg" },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(500);
  });

  it("updates cover image on success", async () => {
    uploadOnCloudinary.mockResolvedValue({ url: "https://cloudinary.com/new-cover.jpg" });
    const updatedUser = { _id: userId, coverImage: "https://cloudinary.com/new-cover.jpg" };
    mockUserFindByIdAndUpdate.mockReturnValue({
      select: vi.fn().mockResolvedValue(updatedUser),
    });

    const { res, outcome } = await invoke(updateUserCoverImage, {
      file: { path: "/tmp/cover.jpg" },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(outcome.payload.data).toEqual(updatedUser);
  });
});

describe("getUserChannelProfile", () => {
  it("rejects missing username", async () => {
    const { outcome } = await invoke(getUserChannelProfile, {
      params: {},
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(400);
  });

  it("returns 404 if channel not found", async () => {
    mockUserAggregate.mockResolvedValue([]);

    const { outcome } = await invoke(getUserChannelProfile, {
      params: { username: "nonexistent" },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("next");
    expect(outcome.err).toBeInstanceOf(ApiError);
    expect(outcome.err.statusCode).toBe(404);
  });

  it("returns channel profile on success", async () => {
    const channelData = {
      username: "testuser",
      fullName: "Test User",
      subscribersCount: 5,
      channelsSubscribedToCount: 3,
      isSubscribed: false,
    };
    mockUserAggregate.mockResolvedValue([channelData]);

    const { res, outcome } = await invoke(getUserChannelProfile, {
      params: { username: "testuser" },
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(outcome.payload.data).toEqual(channelData);
  });
});

describe("getWatchHistory", () => {
  it("returns watch history", async () => {
    const watchHistory = [
      { _id: "v1", title: "Video 1", owner: { username: "owner" } },
    ];
    mockUserAggregate.mockResolvedValue([{ watchHistory }]);

    const { res, outcome } = await invoke(getWatchHistory, {
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("json");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(outcome.payload.data).toEqual(watchHistory);
  });

  it("returns undefined when user has no history", async () => {
    mockUserAggregate.mockResolvedValue([{}]);

    const { outcome } = await invoke(getWatchHistory, {
      user: { _id: userId },
    });

    expect(outcome.kind).toBe("json");
    expect(outcome.payload.data).toBeUndefined();
  });
});
