import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema(
  {
    videofilename: {
      type: String, //Cloudinary URL
      required: true,
    },
    thumbnail: {
      type: String, //Cloudinary URL
      required: true,
    },
    // Cloudinary metadata for durable asset management
    videoPublicId: {
      type: String,
    },
    videoResourceType: {
      type: String,
    },
    thumbnailPublicId: {
      type: String,
    },
    thumbnailResourceType: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

videoSchema.index({
  owner: 1,
  createdAt: -1,
});
videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
