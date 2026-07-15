import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getPlaylistById,
  removeVideoFromPlaylist,
} from "../services/playlist.services.js";
import VideoCard from "../components/video/VideoCard.jsx";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.jsx";

function PlaylistDetails() {
  const { playlistId } = useParams();

  const [playlist, setPlaylist] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const data = await getPlaylistById(playlistId);
        setPlaylist(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPlaylist();
  }, [playlistId]);

  const handleRemove = async (videoId) => {
    try {
      await removeVideoFromPlaylist(playlist._id, videoId);

      toast.success("Video removed");

      const data = await getPlaylistById(playlistId);
      setPlaylist(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove video");
    }
  };

  if (!playlist) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <Helmet>
        <title>{playlist.name} | VidTube</title>
      </Helmet>

      {/* Hero Card */}
      <div className="mb-12 flex flex-col gap-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-8 md:flex-row">
        {/* Left — Thumbnail */}
        <div className="shrink-0">
          <img
            src={
              playlist.videos[0]?.thumbnail ||
              "https://placehold.co/380x214/1e293b/ffffff?text=No+Thumbnail"
            }
            alt={playlist.name}
            className="aspect-video w-full rounded-2xl object-cover md:w-[380px]"
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/380x214/1e293b/ffffff?text=No+Thumbnail";
            }}
          />
        </div>

        {/* Right — Info */}
        <div className="flex flex-col justify-center">
          <h1 className="text-5xl font-extrabold text-white">
            {playlist.name}
          </h1>

          <p className="mt-4 max-w-xl text-slate-400">
            {playlist.description}
          </p>

          <Badge className="mt-4 w-fit rounded-full bg-slate-800 px-4 py-1.5 text-sm">
            {playlist.videos.length} Video{playlist.videos.length !== 1 && "s"}
          </Badge>
        </div>
      </div>

      {/* Videos Section */}
      <h2 className="mb-8 text-4xl font-bold">Videos</h2>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
        {playlist.videos.length === 0 ? (
          <div className="col-span-full flex flex-col items-center rounded-3xl border border-dashed border-slate-700 py-24">
            <p className="text-5xl">📂</p>

            <h2 className="mt-4 text-3xl font-bold">No Videos Yet</h2>

            <p className="mt-2 text-slate-400">
              Add videos from any watch page.
            </p>
          </div>
        ) : (
          playlist.videos.map((video) => (
            <div key={video._id} className="group relative">
              <VideoCard video={video} />

              {/* Remove button — top-right, visible on hover */}
              <button
                onClick={() => setRemoveTarget(video)}
                className="absolute right-4 top-4 z-10 rounded-full bg-black/80 p-2 text-slate-400 opacity-0 transition-all hover:bg-red-600 hover:text-white group-hover:opacity-100"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Remove Confirmation Dialog */}
      <AlertDialog
        open={!!removeTarget}
        onOpenChange={() => setRemoveTarget(null)}
      >
        <AlertDialogContent className="rounded-3xl border border-slate-800 bg-slate-900">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove video?</AlertDialogTitle>

            <AlertDialogDescription>
              This video will be removed from "{playlist.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={() => {
                if (removeTarget) {
                  handleRemove(removeTarget._id);
                  setRemoveTarget(null);
                }
              }}
              className="bg-red-600 hover:bg-red-500"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default PlaylistDetails;
