import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import {
  getUserPlaylists,
  addVideoToPlaylist,
} from "../../services/playlist.services";

import { useSelector } from "react-redux";

function AddToPlaylistDialog({ open, onOpenChange, videoId }) {
  const user = useSelector((state) => state.auth.user);

  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState("");

  useEffect(() => {
    if (!open || !user) return;

    const fetchPlaylists = async () => {
      try {
        const data = await getUserPlaylists(user._id);
        setPlaylists(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPlaylists();
  }, [open, user]);

  const handleAdd = async () => {
    if (!selectedPlaylist) {
      return toast.error("Select a playlist");
    }

    try {
      await addVideoToPlaylist(selectedPlaylist, videoId);

      toast.success("Video added to playlist");

      onOpenChange(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add video");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {playlists.map((playlist) => (
            <label key={playlist._id} className="flex items-center gap-3">
              <input
                type="radio"
                value={playlist._id}
                checked={selectedPlaylist === playlist._id}
                onChange={(e) => setSelectedPlaylist(e.target.value)}
              />

              {playlist.name}
            </label>
          ))}

          <Button className="w-full" onClick={handleAdd}>
            Add to Playlist
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddToPlaylistDialog;
