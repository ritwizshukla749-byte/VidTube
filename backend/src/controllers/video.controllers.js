import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.max(Number(limit) || 10, 1);
  const skip = (pageNumber - 1) * limitNumber;

  const normalizedQuery = typeof query === "string" ? query.trim() : "";
  const normalizedSortBy = ["views", "createdAt", "duration", "title"].includes(
    sortBy
  )
    ? sortBy
    : "views";
  const normalizedSortType = sortType === "asc" ? 1 : -1;

  if (userId && !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const includeOwnerDrafts =
    userId && req.user?._id && String(req.user._id) === String(userId);

  const matchStage = {
    ...(includeOwnerDrafts ? {} : { isPublished: true }),
    ...(userId ? { owner: new mongoose.Types.ObjectId(userId) } : {}),
  };

  // small helper to validate and return a video by id
  const findVideoById = async (videoId) => {
    if (!isValidObjectId(videoId)) {
      throw new ApiError(404, "Video not found");
    }

    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    return video;
  };

  // Publish a new video: upload files to Cloudinary and create a Video document
  const escapedQuery = normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const pipeline = [
    {
      $match: matchStage,
    },
  ];

  if (normalizedQuery) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: escapedQuery, $options: "i" } },
          { description: { $regex: escapedQuery, $options: "i" } },
        ],
      },
    });
  }

  pipeline.push(
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
    {
      $sort: {
        [normalizedSortBy]: normalizedSortType,
      },
    },
    {
      $facet: {
        videos: [{ $skip: skip }, { $limit: limitNumber }],
        totalCount: [{ $count: "count" }],
      },
    }
  );

  const [result] = await Video.aggregate(pipeline);

  const videos = result?.videos ?? [];
  const totalVideos = result?.totalCount?.[0]?.count ?? 0;
  const totalPages = Math.max(Math.ceil(totalVideos / limitNumber), 1);

  return res.status(200).json(
    new ApiResponse(200, "Videos fetched successfully", {
      videos,
      pagination: {
        totalVideos,
        totalPages,
        currentPage: pageNumber,
        limit: limitNumber,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      },
    })
  );
});

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description, isPublished } = req.body;

  if (
    ![title, description].every((f) => typeof f === "string" && f.trim() !== "")
  ) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoLocalPath = req.files?.video?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is required");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail image is required");
  }

  let videoUpload = null;
  let thumbUpload = null;

  try {
    videoUpload = await uploadOnCloudinary(videoLocalPath);
    
    if (!videoUpload?.secure_url) throw new Error("Video upload failed");
  } catch (err) {
    throw new ApiError(500, "Failed to upload video");
  }

  try {
    thumbUpload = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbUpload?.secure_url) throw new Error("Thumbnail upload failed");
  } catch (err) {
    if (videoUpload?.public_id)
      await deleteFromCloudinary(videoUpload.public_id, videoUpload.resource_type);
    throw new ApiError(500, "Failed to upload thumbnail");
  }

  try {
    const created = await Video.create({
      videofilename: videoUpload.secure_url,
      thumbnail: thumbUpload.secure_url,
      title: title.trim(),
      description: description.trim(),
      duration: Number(videoUpload.duration) || 0,
      isPublished: isPublished === "false" ? false : true,
      owner: req.user._id,
      views: 0,
      videoPublicId: videoUpload.public_id,
      videoResourceType: videoUpload.resource_type,
      thumbnailPublicId: thumbUpload.public_id,
      thumbnailResourceType: thumbUpload.resource_type,
    });

    await created.populate("owner", "fullName username avatar");

    return res
      .status(201)
      .json(new ApiResponse(201, "Video published successfully", created));
  } catch (err) {
    // cleanup uploaded assets
    if (videoUpload?.public_id)
      await deleteFromCloudinary(videoUpload.public_id, videoUpload.resource_type);
    if (thumbUpload?.public_id)
      await deleteFromCloudinary(thumbUpload.public_id, thumbUpload.resource_type);
    throw new ApiError(500, "Failed to create video");
  }
});

// Shared helper: find video by id, populate owner, and enforce visibility/ownership rules
const findVideoAndAuthorize = async (req, videoId, options = {}) => {
  const { requireOwner = false } = options;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(404, "Video not found");
  }

  const video = await Video.findById(videoId).populate(
    "owner",
    "fullName username avatar"
  );

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const ownerId = video.owner?._id ?? video.owner;
  const isOwner = req.user && String(req.user._id) === String(ownerId);

  if (!video.isPublished && !isOwner) {
    throw new ApiError(404, "Video not found");
  }

  if (requireOwner && !isOwner) {
    throw new ApiError(403, "You are not authorized to perform this action");
  }

  return { video, isOwner };
};

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const { video, isOwner } = await findVideoAndAuthorize(req, videoId, {
    requireOwner: false,
  });

  if (!video.isPublished && !isOwner) {
    throw new ApiError(404, "Video not found");
  }

  let updatedVideo;

  // Increase views only for other users
  if (video.isPublished && !isOwner) {
    updatedVideo = await Video.findByIdAndUpdate(
      video._id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("owner", "fullName username avatar");
  } else {
    updatedVideo = await Video.findById(video._id).populate(
      "owner",
      "fullName username avatar"
    );
  }

  // Add to watch history for every logged-in user
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: {
        watchHistory: video._id,
      },
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Video fetched successfully", updatedVideo));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  const { video } = await findVideoAndAuthorize(req, videoId, {
    requireOwner: true,
  });

  const oldThumbnailPublicId = video.thumbnailPublicId;
  const oldThumbnailResourceType = video.thumbnailResourceType;

  const updatePayload = {};

  if (typeof title === "string") {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      throw new ApiError(400, "Title cannot be empty");
    }
    updatePayload.title = trimmedTitle;
  }

  if (typeof description === "string") {
    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      throw new ApiError(400, "Description cannot be empty");
    }
    updatePayload.description = trimmedDescription;
  }

  const thumbnailLocalPath = req.file?.path || req.files?.thumbnail?.[0]?.path;
  let uploadedThumbnail = null;

  if (thumbnailLocalPath) {
    try {
      uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
      if (!uploadedThumbnail?.secure_url) {
        throw new Error("Thumbnail upload failed");
      }

      updatePayload.thumbnail = uploadedThumbnail.secure_url;
      updatePayload.thumbnailPublicId = uploadedThumbnail.public_id;
      updatePayload.thumbnailResourceType = uploadedThumbnail.resource_type;
    } catch (error) {
      throw new ApiError(500, "Failed to upload thumbnail");
    }
  }

  if (Object.keys(updatePayload).length === 0) {
    throw new ApiError(400, "At least one field is required to update");
  }

  try {
    const updatedVideo = await Video.findByIdAndUpdate(
      video._id,
      { $set: updatePayload },
      { new: true }
    ).populate("owner", "fullName username avatar");

    // If we uploaded a new thumbnail and the video had an old thumbnail
    // attempt to delete the old thumbnail from Cloudinary asynchronously.
    if (uploadedThumbnail && oldThumbnailPublicId) {
      try {
        await deleteFromCloudinary(oldThumbnailPublicId, oldThumbnailResourceType);
      } catch (err) {
        console.error("Failed to delete old thumbnail from Cloudinary", err);
      }
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Video updated successfully", updatedVideo));
  } catch (error) {
    if (uploadedThumbnail?.public_id) {
      await deleteFromCloudinary(uploadedThumbnail.public_id, uploadedThumbnail.resource_type);
    }

    throw new ApiError(500, "Failed to update video");
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const { video } = await findVideoAndAuthorize(req, videoId, {
    requireOwner: true,
  });

  // Attempt to delete associated Cloudinary assets (best-effort).
  try {
    if (video.videoPublicId) {
      await deleteFromCloudinary(video.videoPublicId, video.videoResourceType);
    }
  } catch (err) {
    console.error("Failed to delete video asset from Cloudinary", err);
  }

  try {
    if (video.thumbnailPublicId) {
      await deleteFromCloudinary(video.thumbnailPublicId, video.thumbnailResourceType);
    }
  } catch (err) {
    console.error("Failed to delete thumbnail from Cloudinary", err);
  }

  await Video.findByIdAndDelete(video._id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Video deleted successfully", null));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const { video } = await findVideoAndAuthorize(req, videoId, {
    requireOwner: true,
  });

  const updatedVideo = await Video.findByIdAndUpdate(
    video._id,
    { $set: { isPublished: !video.isPublished } },
    { new: true }
  ).populate("owner", "fullName username avatar");

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Publish status updated successfully", updatedVideo)
    );
});

export {
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
