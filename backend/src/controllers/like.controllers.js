import { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { Video } from "../models/video.models.js";
import { Comment } from "../models/comment.models.js";
import { Tweet } from "../models/tweet.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.deleteOne({ _id: existingLike._id });
    return res
      .status(200)
      .json(new ApiResponse(200, "Video unliked successfully", {}));
  }

  await Like.create({ video: videoId, likedBy: req.user._id });

  return res
    .status(200)
    .json(new ApiResponse(200, "Video liked successfully", {}));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.deleteOne({ _id: existingLike._id });
    return res
      .status(200)
      .json(new ApiResponse(200, "Comment unliked successfully", {}));
  }

  await Like.create({ comment: commentId, likedBy: req.user._id });

  return res
    .status(200)
    .json(new ApiResponse(200, "Comment liked successfully", {}));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }
  
  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.deleteOne({ _id: existingLike._id });
    return res
      .status(200)
      .json(new ApiResponse(200, "Tweet unliked successfully", {}));
  }

  await Like.create({ tweet: tweetId, likedBy: req.user._id });

  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet liked successfully", {}));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.find({
    likedBy: req.user._id,
  }).populate({
    path: "video",
    populate: {
      path: "owner",
      select: "fullName username avatar",
    },
  });

  const validLikedVideos = likedVideos.filter((like) => like.video !== null);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Liked videos fetched successfully",
        validLikedVideos
      )
    );
});

const getLikeStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const [existingLike, likeCount] = await Promise.all([
    Like.exists({ likedBy: req.user._id, video: videoId }),
    Like.countDocuments({ video: videoId }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, "Like status fetched successfully", {
      liked: !!existingLike,
      likeCount,
    })
  );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos, getLikeStatus };
