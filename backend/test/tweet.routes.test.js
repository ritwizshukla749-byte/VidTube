import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const middlewareState = {
  user: { _id: "64b64c1f0000000000000001" },
};

vi.mock("../src/controllers/tweet.controllers.js", () => ({
  createTweet: vi.fn((req, res) => {
    return res.status(201).json({
      route: "createTweet",
      user: req.user,
      body: req.body,
    });
  }),
  getUserTweets: vi.fn((req, res) => {
    return res.status(200).json({
      route: "getUserTweets",
      user: req.user,
      params: req.params,
    });
  }),
  updateTweet: vi.fn((req, res) => {
    return res.status(200).json({
      route: "updateTweet",
      user: req.user,
      params: req.params,
      body: req.body,
    });
  }),
  deleteTweet: vi.fn((req, res) => {
    return res.status(200).json({
      route: "deleteTweet",
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
const { createTweet, getUserTweets, updateTweet, deleteTweet } =
  await import("../src/controllers/tweet.controllers.js");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("tweet routes", () => {
  it("protects the create tweet route", async () => {
    const response = await request(app)
      .post("/api/v1/tweets")
      .send({ content: "My tweet" });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      route: "createTweet",
      user: middlewareState.user,
      body: { content: "My tweet" },
    });
    expect(createTweet).toHaveBeenCalledTimes(1);
  });

  it("forwards getUserTweets with userId param", async () => {
    const response = await request(app).get(
      "/api/v1/tweets/user/64b64c1f0000000000000002"
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "getUserTweets",
      user: middlewareState.user,
      params: { userId: "64b64c1f0000000000000002" },
    });
    expect(getUserTweets).toHaveBeenCalledTimes(1);
  });

  it("protects updateTweet route", async () => {
    const response = await request(app)
      .patch("/api/v1/tweets/64b64c1f0000000000000003")
      .send({ content: "Updated content" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "updateTweet",
      user: middlewareState.user,
      params: { tweetId: "64b64c1f0000000000000003" },
      body: { content: "Updated content" },
    });
    expect(updateTweet).toHaveBeenCalledTimes(1);
  });

  it("protects deleteTweet route", async () => {
    const response = await request(app).delete(
      "/api/v1/tweets/64b64c1f0000000000000003"
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      route: "deleteTweet",
      user: middlewareState.user,
      params: { tweetId: "64b64c1f0000000000000003" },
    });
    expect(deleteTweet).toHaveBeenCalledTimes(1);
  });
});
