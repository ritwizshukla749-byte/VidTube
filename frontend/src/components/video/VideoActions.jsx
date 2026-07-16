import { ThumbsUp, Share2, Bookmark } from "lucide-react";
import { Button } from "../ui/button";
import {
  toggleVideoLike,
  getLikeStatus,
} from "../../services/like.services.js";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import AddToPlaylistDialog from "../playlist/AddToPlaylistDialog";

function VideoActions({ videoId }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/watch/${videoId}`
    );
    toast.success("Link copied!");
  };
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await getLikeStatus(videoId);
        setLiked(response.liked);
        setLikeCount(response.likeCount);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStatus();
  }, [videoId]);
  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to like a video");
      return;
    }
    try {
      await toggleVideoLike(videoId);
      setLiked((prev) => !prev);
      setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <>
      <div className="mt-6 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* LIKE */}
          <Button
            onClick={handleLike}
            className={`h-11 rounded-full border px-5 transition-all duration-300 ${
              liked
                ? "border-red-500 bg-red-500/10 text-white hover:bg-red-500/20"
                : "border-slate-700 bg-slate-900 text-white hover:bg-slate-800 hover:border-slate-500"
            }`}
          >
            <ThumbsUp
              className="mr-2 h-4 w-4"
              fill={liked ? "currentColor" : "none"}
            />
            <span>{likeCount > 0 ? likeCount.toLocaleString() : "Like"}</span>
          </Button>

          {/* SHARE */}
          <Button
            onClick={handleShare}
            variant="ghost"
            className="h-11 rounded-full border border-slate-700 bg-slate-900 px-5 text-white hover:bg-slate-800 hover:border-slate-500 transition-all duration-300"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>

          {/* SAVE */}
          <Button
            variant="ghost"
            onClick={() => {
              if (!isAuthenticated) {
                toast.error("Please log in to save to playlist");
                return;
              }
              setPlaylistDialogOpen(true);
            }}
            className="h-11 rounded-full border border-slate-700 bg-slate-900 px-5 text-white hover:bg-slate-800 hover:border-slate-500 transition-all duration-300"
          >
            <Bookmark className="mr-2 h-4 w-4" />
            Save to playlist
          </Button>
        </div>

        <AddToPlaylistDialog
          open={playlistDialogOpen}
          onOpenChange={setPlaylistDialogOpen}
          videoId={videoId}
        />
      </div>
    </>
  );
}

export default VideoActions;
