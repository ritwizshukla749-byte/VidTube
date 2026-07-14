import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  getUserPlaylists,
  createPlaylist,
  deletePlaylist,
} from "../services/playlist.services.js";
import { Button } from "../components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


function Playlists() {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const fetchPlaylists = async () => {
    try {
      const data = await getUserPlaylists(user._id);
      setPlaylists(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPlaylists();
    }
  }, [user]);

  const handleCreate = async () => {
    if (!name.trim() || !description.trim()) {
      return toast.error("Fill all fields");
    }

    try {
      await createPlaylist({
        name,
        description,
      });

      toast.success("Playlist created");

      setName("");
      setDescription("");

      fetchPlaylists();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create playlist");
    }
  };

  const handleDelete = async (playlistId) => {
    try {
      await deletePlaylist(playlistId);

      toast.success("Playlist deleted");

      fetchPlaylists();
    } catch (err) {
      toast.error("Failed to delete playlist");
    }
  };
  return (
    <div className="mx-auto max-w-5xl p-8">
      <h1 className="mb-8 text-3xl font-bold text-white">My Playlists</h1>

      <div className="mb-8 rounded-xl bg-slate-900 p-6">
        <input
          placeholder="Playlist Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-3 w-full rounded-md border border-slate-700 bg-slate-950 p-3 text-white"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mb-3 w-full rounded-md border border-slate-700 bg-slate-950 p-3 text-white"
        />

        <button
          onClick={handleCreate}
          className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
        >
          Create Playlist
        </button>
      </div>

      <div className="space-y-4">
        {playlists.length === 0 ? (
          <p className="text-slate-400">No playlists yet.</p>
        ) : (
          playlists.map((playlist) => (
            <div
              key={playlist._id}
              onClick={() => navigate(`/playlists/${playlist._id}`)}
              className="cursor-pointer rounded-xl bg-slate-900 p-5 transition hover:bg-slate-800"
            >
              <h2 className="text-xl font-semibold text-white">
                {playlist.name}
              </h2>

              <p className="mt-2 text-slate-400">{playlist.description}</p>

              <p className="mt-3 text-sm text-slate-500">
                {playlist.videos.length} Videos
              </p>

              <Button
                variant="destructive"
                className="mt-4"
                onClick={(e) => {
                  e.stopPropagation();

                  if (window.confirm("Delete this playlist?")) {
                    handleDelete(playlist._id);
                  }
                }}
              >
                Delete Playlist
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Playlists;
