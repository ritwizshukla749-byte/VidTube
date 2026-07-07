import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  const channelId = new mongoose.Types.ObjectId(req.user._id);

  // Count subscribers
  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });

  // Aggregate videos, views and likes
  const stats = await Video.aggregate([
    {
      $match: {
        owner: channelId,
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
      },
    },
    {
      $group: {
        _id: null,
        totalVideos: {
          $sum: 1,
        },
        totalViews: {
          $sum: "$views",
        },
        totalLikes: {
          $sum: "$likesCount",
        },
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(200, "Channel statistics fetched successfully.", {
      totalSubscribers,
      totalVideos: stats[0]?.totalVideos || 0,
      totalViews: stats[0]?.totalViews || 0,
      totalLikes: stats[0]?.totalLikes || 0,
    })
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel

  const videos = await Video.find({
    owner: req.user._id,
  }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, "Channel videos fetched successfully.", videos));
});

export { getChannelStats, getChannelVideos };
