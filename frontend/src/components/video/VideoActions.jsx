import { ThumbsUp, Share2, Bookmark } from "lucide-react";
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
    <div className="mt-5 flex flex-wrap gap-3">
      <Button variant={liked ? "default" : "secondary"} onClick={handleLike}>
        <ThumbsUp className="mr-2 h-4 w-4" />
        {liked ? "Liked" : "Like"}
      </Button>

      <Button variant="secondary">
        <Share2 className="mr-2 h-4 w-4" />
        Share
      </Button>

      <Button variant="secondary" onClick={() => setPlaylistDialogOpen(true)}>
        <Bookmark className="mr-2 h-4 w-4" />
        Save
      </Button>
      <AddToPlaylistDialog
        open={playlistDialogOpen}
        onOpenChange={setPlaylistDialogOpen}
        videoId={videoId}
      />
    </div>
  );
}

export default VideoActions;
