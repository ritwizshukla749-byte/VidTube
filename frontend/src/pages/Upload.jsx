import { useState } from "react";
import { useForm } from "react-hook-form";
import { publishVideo } from "../services/video.services";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Upload() {
  const {
    register,
    handleSubmit,
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

      toast.success(response.message);

      navigate(`/watch/${response.data._id}`);
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center py-10">
      <div className="w-full max-w-2xl rounded-xl bg-slate-900 p-8">
        <h1 className="mb-8 text-center text-3xl font-bold text-white">
          Upload Video
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Title */}

          <div>
            <input
              type="text"
              placeholder="Video Title"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white"
              {...register("title", {
                required: "Title is required",
              })}
            />
            {errors.video && (
              <p className="mt-1 text-sm text-red-500">
                {errors.video.message}
              </p>
            )}

            {errors.title && (
              <p className="mt-1 text-sm text-red-500">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}

          <div>
            <textarea
              rows={5}
              placeholder="Description"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white"
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

          {/* Video */}

          <div className="rounded-xl border-2 border-dashed border-slate-700 p-6">
            <label className="mb-4 block text-lg font-semibold text-white">
               Upload Video
            </label>

            <input
              type="file"
              accept="video/*"
              className="w-full text-white"
              {...register("video", {
                required: "Video is required",
                onChange: (e) => {
                  setVideoName(e.target.files?.[0]?.name || "");
                },
              })}
            />

            <p className="mt-3 text-sm text-slate-400">
              MP4, MOV, AVI supported
            </p>

            {videoName && (
              <p className="mt-4 rounded-lg bg-green-900/30 p-3 text-green-400">
                ✅ {videoName}
              </p>
            )}
          </div>

          {/* Thumbnail */}

          <div className="rounded-xl border-2 border-dashed border-slate-700 p-6">
            <label className="mb-4 block text-lg font-semibold text-white">
               Thumbnail
            </label>

            <input
              type="file"
              accept="image/*"
              className="w-full text-white"
              {...register("thumbnail", {
                required: "Thumbnail is required",
                onChange: (e) => {
                  setThumbnailName(e.target.files?.[0]?.name || "");
                },
              })}
            />

            <p className="mt-3 text-sm text-slate-400">JPG, PNG, WEBP</p>

            {thumbnailName && (
              <p className="mt-4 rounded-lg bg-green-900/30 p-3 text-green-400">
                ✅ {thumbnailName}
              </p>
            )}
          </div>

          {/* Published */}

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              defaultChecked
              {...register("isPublished")}
            />

            <label className="text-white">Publish immediately</label>
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full rounded-lg bg-red-600 py-3 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Upload;
