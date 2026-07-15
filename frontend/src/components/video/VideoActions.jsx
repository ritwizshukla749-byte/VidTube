import { ThumbsUp, Share2, Bookmark, MoreVertical } from "lucide-react";
import { Button } from "../ui/button";
import {
  toggleVideoLike,
  getLikeStatus,
} from "../../services/like.services.js";
import { useState, useEffect } from "react";
import AddToPlaylistDialog from "../playlist/AddToPlaylistDialog";

function VideoActions({ videoId }) {
  const [liked, setLiked] = useState(false);
  const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false);
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await getLikeStatus(videoId);
        setLiked(response.liked);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStatus();
  }, [videoId]);
  const handleLike = async () => {
    try {
      await toggleVideoLike(videoId);
      setLiked((prev) => !prev);
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
            <ThumbsUp className="mr-2 h-4 w-4" />
            <span>{liked ? "12" : "Like"}</span>
          </Button>

          {/* SHARE */}
          <Button
            variant="ghost"
            className="h-11 rounded-full border border-slate-700 bg-slate-900 px-5 text-white hover:bg-slate-800 hover:border-slate-500 transition-all duration-300"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>

          {/* SAVE */}
          <Button
            variant="ghost"
            onClick={() => setPlaylistDialogOpen(true)}
            className="h-11 rounded-full border border-slate-700 bg-slate-900 px-5 text-white hover:bg-slate-800 hover:border-slate-500 transition-all duration-300"
          >
            <Bookmark className="mr-2 h-4 w-4" />
            Save to playlist
          </Button>
        </div>

        {/* MORE */}
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 rounded-full border border-slate-700 bg-slate-900 hover:bg-slate-800 hover:border-slate-500 transition-all duration-300"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>

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
