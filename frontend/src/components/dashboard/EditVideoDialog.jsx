import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { updateVideo } from "../../services/video.services";
import toast from "react-hot-toast";
function EditVideoDialog({ open, onOpenChange, video, onVideoUpdated }) {
  const [isSaving, setIsSaving] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  useEffect(() => {
    if (video) {
      reset({
        title: video.title,
        description: video.description,
      });
    }
  }, [video, reset]);
  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const formData = new FormData();

      formData.append("title", data.title);
      formData.append("description", data.description);

      if (data.thumbnail?.[0]) {
        formData.append("thumbnail", data.thumbnail[0]);
      }

      const updatedVideo = await updateVideo(video._id, formData);

      toast.success("Video updated successfully");
      onVideoUpdated(updatedVideo);
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to update video");
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border border-slate-800 bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Video</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="mb-2 block">Title</label>

            <input
              {...register("title", {
                required: "Title is required",
              })}
              className="w-full rounded border border-slate-700 bg-slate-960 p-3"
            />

            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block">Description</label>

            <textarea
              rows={5}
              {...register("description", {
                required: "Description is required",
              })}
              className="w-full rounded border border-slate-700 bg-slate-960 p-3"
            />

            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block">Thumbnail (optional)</label>

            <input type="file" accept="image/*" {...register("thumbnail")} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditVideoDialog;
