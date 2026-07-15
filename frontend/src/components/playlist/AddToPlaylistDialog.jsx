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
  const [isAdding, setIsAdding] = useState(false);

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

  useEffect(() => {
    if (!open) {
      setSelectedPlaylist("");
    }
  }, [open]);

  const handleAdd = async () => {
    if (!selectedPlaylist) {
      return toast.error("Select a playlist");
    }

    setIsAdding(true);
    try {
      await addVideoToPlaylist(selectedPlaylist, videoId);

      toast.success("Video added to playlist");

      onOpenChange(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add video");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border border-slate-800 bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">
            Add to Playlist
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {playlists.length === 0 ? (
            <p className="py-8 text-center text-slate-400">
              No playlists yet. Create one first.
            </p>
          ) : (
            playlists.map((playlist) => (
              <label
                key={playlist._id}
                className={`flex cursor-pointer items-center gap-4 rounded-xl p-3 transition hover:bg-slate-800 ${
                  selectedPlaylist === playlist._id
                    ? "bg-slate-800 ring-1 ring-red-500"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  value={playlist._id}
                  checked={selectedPlaylist === playlist._id}
                  onChange={(e) => setSelectedPlaylist(e.target.value)}
                  className="sr-only"
                />

                <img
                  src={
                    playlist.thumbnail ||
                    "https://placehold.co/96x64/1e293b/ffffff?text=No+Thumbnail"
                  }
                  alt={playlist.name}
                  className="h-16 w-24 rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://placehold.co/96x64/1e293b/ffffff?text=No+Thumbnail";
                  }}
                />

                <div className="flex-1">
                  <p className="font-semibold text-white">{playlist.name}</p>

                  <p className="text-sm text-slate-400">
                    {playlist.videoCount} video{playlist.videoCount !== 1 && "s"}
                  </p>
                </div>

                {selectedPlaylist === playlist._id && (
                  <span className="text-lg text-red-500">◉</span>
                )}
              </label>
            ))
          )}

          {playlists.length > 0 && (
            <Button
              className="mt-4 h-12 w-full rounded-full bg-red-600 text-base font-semibold hover:bg-red-500"
              onClick={handleAdd}
              disabled={isAdding}
            >
              {isAdding ? "Adding..." : "Add to Playlist"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddToPlaylistDialog;
