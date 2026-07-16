import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, Bookmark, Share2 } from "lucide-react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddToPlaylistDialog from "../playlist/AddToPlaylistDialog";

function VideoCard({ video }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false);

  const handleShare = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(
      `${window.location.origin}/watch/${video._id}`
    );
    toast.success("Link copied!");
  };

  const handleSaveToPlaylist = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please log in to save to playlist");
      return;
    }
    setPlaylistDialogOpen(true);
  };
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    }

    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }

    return views;
  };
  return (
    <Link to={`/watch/${video._id}`} className="group">
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 transition-all duration-300 hover:border-slate-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30">
        <div className="relative overflow-hidden rounded-t-2xl shadow-lg">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="aspect-video w-full rounded-t-2xl object-cover transition-all duration-500 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/600x338/1e293b/ffffff?text=No+Image";
            }}
          />

          <span className="absolute bottom-3 right-3 rounded-lg bg-black/75 px-2 py-1 text-xs font-semibold backdrop-blur">
            {formatDuration(video.duration)}
          </span>
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <img
              src={video.owner.avatar}
              alt={video.owner.username}
              className="h-10 w-10 md:h-11 md:w-11 rounded-full border border-slate-700 object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/600x338/1e293b/ffffff?text=No+Image";
              }}
            />

            <div>
              <h2 className="line-clamp-2 text-sm md:text-[15px] font-semibold leading-6 text-white transition-colors group-hover:text-red-400">
                {video.title}
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {video.owner.fullName}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {formatViews(video.views)} views •{" "}
                {formatDistanceToNow(new Date(video.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.preventDefault()}
                className="self-start rounded-full p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSaveToPlaylist}>
                <Bookmark className="mr-2 h-4 w-4" />
                Save to Playlist
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AddToPlaylistDialog
        open={playlistDialogOpen}
        onOpenChange={setPlaylistDialogOpen}
        videoId={video._id}
      />
    </Link>
  );
}

export default VideoCard;
