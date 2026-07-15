import { useState } from "react";
import { useForm } from "react-hook-form";
import { publishVideo } from "../services/video.services";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

function Upload() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const [videoName, setVideoName] = useState("");
  const [thumbnailName, setThumbnailName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const onSubmit = async (data) => {
    try {
      setIsUploading(true);
      const formData = new FormData();

      formData.append("title", data.title);
      formData.append("description", data.description);

      formData.append("video", data.video[0]);
      formData.append("thumbnail", data.thumbnail[0]);

      formData.append("isPublished", data.isPublished);

      const response = await publishVideo(formData);

      toast.success("Video uploaded successfully");

      navigate(`/watch/${response.data._id}`);
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-10 py-10">
      <Helmet>
        <title>Upload | VidTube</title>
      </Helmet>

      {/* Header */}
      <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
        <h1 className="text-5xl font-extrabold text-white">Upload Video</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ① Video Details */}
        <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
          <h2 className="mb-6 text-xl font-bold text-white">
            ① Video Details
          </h2>

          {/* Title */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">
                Title
              </label>
              <span className="text-sm text-slate-500">
                {watch("title")?.length || 0}/100
              </span>
            </div>

            <input
              type="text"
              placeholder="Video Title"
              maxLength={100}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/40 px-5 py-4 text-white placeholder:text-slate-500 focus:border-red-500 focus:outline-none"
              {...register("title", {
                required: "Title is required",
              })}
            />

            {errors.title && (
              <p className="mt-1 text-sm text-red-500">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">
                Description
              </label>
              <span className="text-sm text-slate-500">
                {watch("description")?.length || 0}/5000
              </span>
            </div>

            <textarea
              rows={6}
              maxLength={5000}
              placeholder="Description"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/40 px-5 py-4 text-white placeholder:text-slate-500 focus:border-red-500 focus:outline-none"
              {...register("description", {
                required: "Description is required",
              })}
            />

            {errors.description && (
              <p className="mt-1 text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        {/* ② Video File */}
        <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
          <h2 className="mb-6 text-xl font-bold text-white">② Video File</h2>

          <input
            type="file"
            accept="video/*"
            className="hidden"
            id="video-upload"
            {...register("video", {
              required: "Video is required",
              onChange: (e) => {
                setVideoName(e.target.files?.[0]?.name || "");
              },
            })}
          />

          <label
            htmlFor="video-upload"
            className="block cursor-pointer rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/30 p-16 text-center transition-all hover:border-red-500 hover:bg-slate-900"
          >
            {videoName ? (
              <p className="text-lg font-medium text-green-400">
                ✅ {videoName}
              </p>
            ) : (
              <>
                <p className="text-4xl">⬆</p>

                <p className="mt-4 text-lg font-semibold text-white">
                  Drag & drop your video here
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  or click to browse
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  MP4, MOV, AVI up to 2GB
                </p>
              </>
            )}
          </label>

          {errors.video && (
            <p className="mt-2 text-sm text-red-500">
              {errors.video.message}
            </p>
          )}
        </div>

        {/* ③ Thumbnail */}
        <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
          <h2 className="mb-6 text-xl font-bold text-white">
            ③ Thumbnail
          </h2>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="thumbnail-upload"
            {...register("thumbnail", {
              required: "Thumbnail is required",
              onChange: (e) => {
                setThumbnailName(e.target.files?.[0]?.name || "");
              },
            })}
          />

          <label
            htmlFor="thumbnail-upload"
            className="block cursor-pointer rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/30 p-16 text-center transition-all hover:border-red-500 hover:bg-slate-900"
          >
            {thumbnailName ? (
              <p className="text-lg font-medium text-green-400">
                ✅ {thumbnailName}
              </p>
            ) : (
              <>
                <p className="text-4xl">⬆</p>

                <p className="mt-4 text-lg font-semibold text-white">
                  Drag & drop your thumbnail here
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  or click to browse
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  JPG, PNG, WEBP up to 10MB
                </p>
              </>
            )}
          </label>

          {errors.thumbnail && (
            <p className="mt-2 text-sm text-red-500">
              {errors.thumbnail.message}
            </p>
          )}
        </div>

        {/* ☑ Publish */}
        <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              {...register("isPublished")}
              className="mt-1"
            />

            <div>
              <p className="font-medium text-white">
                Publish immediately
              </p>

              <p className="text-sm text-slate-400">
                Make your video visible to everyone right away
              </p>
            </div>
          </label>
        </div>

        {/* Upload Button */}
        <button
          type="submit"
          disabled={isUploading}
          className="h-16 w-full rounded-full bg-red-600 text-lg font-semibold text-white shadow-[0_0_40px_rgba(239,68,68,.25)] transition-all hover:bg-red-500 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? "Uploading..." : "↑ Upload Video"}
        </button>
      </form>
    </div>
  );
}

export default Upload;
