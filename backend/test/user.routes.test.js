import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const middlewareState = {
  user: { _id: "64b64c1f0000000000000001" },
  files: {
    avatar: [{ path: "c:/tmp/avatar.jpg" }],
    coverImage: [{ path: "c:/tmp/cover.jpg" }],
  },
  file: { path: "c:/tmp/new-avatar.jpg" },
};

vi.mock("../src/controllers/user.controllers.js", () => ({
  registerUser: vi.fn((req, res) => {
    return res.status(201).json({
      route: "registerUser",
      body: req.body,
      files: req.files,
    });
  }),
  loginUser: vi.fn((req, res) => {
    return res.status(200).json({
      route: "loginUser",
      body: req.body,
    });
  }),
  refreshAccessToken: vi.fn((req, res) => {
    return res.status(200).json({
      route: "refreshAccessToken",
      body: req.body,
    });
  }),
  logoutUser: vi.fn((req, res) => {
    return res.status(200).json({
      route: "logoutUser",
      user: req.user,
    });
  }),
  changeCurrentPassword: vi.fn((req, res) => {
    return res.status(200).json({
      route: "changeCurrentPassword",
      user: req.user,
      body: req.body,
    });
  }),
  getCurrentUser: vi.fn((req, res) => {
    return res.status(200).json({
      route: "getCurrentUser",
      user: req.user,
    });
  }),
  getUserChannelProfile: vi.fn((req, res) => {
    return res.status(200).json({
      route: "getUserChannelProfile",
      user: req.user,
      params: req.params,
    });
  }),
  updateAccountDetails: vi.fn((req, res) => {
    return res.status(200).json({
      route: "updateAccountDetails",
      user: req.user,
      body: req.body,
    });
  }),
  updateUserAvatar: vi.fn((req, res) => {
    return res.status(200).json({
      route: "updateUserAvatar",
      user: req.user,
      file: req.file,
    });
  }),
  updateUserCoverImage: vi.fn((req, res) => {
    return res.status(200).json({
      route: "updateUserCoverImage",
      user: req.user,
      file: req.file,
    });
  }),
  getWatchHistory: vi.fn((req, res) => {
    return res.status(200).json({
      route: "getWatchHistory",
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
const {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getWatchHistory,
} = await import("../src/controllers/user.controllers.js");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("user routes", () => {
  it("forwards registerUser (public) with uploaded files", async () => {
    const response = await request(app)
      .post("/api/v1/users/register")
      .send({
        username: "testuser",
        email: "test@example.com",
        password: "Pass123!",
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      route: "registerUser",
      body: {
        username: "testuser",
        email: "test@example.com",
        password: "Pass123!",
      },
      files: middlewareState.files,
    });
    expect(registerUser).toHaveBeenCalledTimes(1);
  });

  it("forwards loginUser (public)", async () => {
    const response = await request(app)
      .post("/api/v1/users/login")
      .send({ email: "test@example.com", password: "Pass123!" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "loginUser",
      body: { email: "test@example.com", password: "Pass123!" },
    });
    expect(loginUser).toHaveBeenCalledTimes(1);
  });

  it("forwards refreshAccessToken (public)", async () => {
    const response = await request(app)
      .post("/api/v1/users/refresh-token")
      .send({ refreshToken: "some-token" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "refreshAccessToken",
      body: { refreshToken: "some-token" },
    });
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
  });

  it("protects logoutUser", async () => {
    const response = await request(app).post("/api/v1/users/logout");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "logoutUser",
      user: middlewareState.user,
    });
    expect(logoutUser).toHaveBeenCalledTimes(1);
  });

  it("protects changeCurrentPassword", async () => {
    const response = await request(app)
      .post("/api/v1/users/change-password")
      .send({ oldPassword: "old", newPassword: "new" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "changeCurrentPassword",
      user: middlewareState.user,
      body: { oldPassword: "old", newPassword: "new" },
    });
    expect(changeCurrentPassword).toHaveBeenCalledTimes(1);
  });

  it("protects getCurrentUser", async () => {
    const response = await request(app).get("/api/v1/users/current-user");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "getCurrentUser",
      user: middlewareState.user,
    });
    expect(getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it("protects getUserChannelProfile with username param", async () => {
    const response = await request(app).get("/api/v1/users/c/testuser");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "getUserChannelProfile",
      user: middlewareState.user,
      params: { username: "testuser" },
    });
    expect(getUserChannelProfile).toHaveBeenCalledTimes(1);
  });

  it("protects updateAccountDetails", async () => {
    const response = await request(app)
      .patch("/api/v1/users/update-account")
      .send({ fullName: "New Name" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "updateAccountDetails",
      user: middlewareState.user,
      body: { fullName: "New Name" },
    });
    expect(updateAccountDetails).toHaveBeenCalledTimes(1);
  });

  it("protects updateUserAvatar and injects file", async () => {
    const response = await request(app).patch("/api/v1/users/avatar");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "updateUserAvatar",
      user: middlewareState.user,
      file: middlewareState.file,
    });
    expect(updateUserAvatar).toHaveBeenCalledTimes(1);
  });

  it("protects updateUserCoverImage and injects file", async () => {
    const response = await request(app).patch("/api/v1/users/cover-image");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "updateUserCoverImage",
      user: middlewareState.user,
      file: middlewareState.file,
    });
    expect(updateUserCoverImage).toHaveBeenCalledTimes(1);
  });

  it("protects getWatchHistory", async () => {
    const response = await request(app).get("/api/v1/users/watch-history");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "getWatchHistory",
      user: middlewareState.user,
    });
    expect(getWatchHistory).toHaveBeenCalledTimes(1);
  });
});
