import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";

import { Plus, MoreVertical, FolderOpen, Trash2 } from "lucide-react";

import {
  getUserPlaylists,
  createPlaylist,
  deletePlaylist,
} from "../services/playlist.services";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

function Playlists() {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

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

    setIsCreating(true);
    try {
      await createPlaylist({
        name,
        description,
      });

      toast.success("Playlist created");

      setName("");
      setDescription("");
      setDialogOpen(false);

      fetchPlaylists();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create playlist");
    } finally {
      setIsCreating(false);
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
    <div className="mx-auto max-w-7xl px-10 py-10">
      <Helmet>
        <title>Playlists | VidTube</title>
      </Helmet>

      {/* Header */}
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-extrabold text-white">My Playlists</h1>
        </div>

        <Button
          onClick={() => setDialogOpen(true)}
          className="h-12 rounded-full bg-red-600 px-8 hover:bg-red-500"
        >
          <Plus className="mr-2 h-5 w-5" />
          Create Playlist
        </Button>
      </div>

      <div className="mb-10 border-b border-slate-800"></div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {playlists.length === 0 ? (
          <div className="col-span-full flex flex-col items-center rounded-3xl border border-dashed border-slate-700 py-24">
            <FolderOpen className="mb-5 h-16 w-16 text-slate-500" />

            <h2 className="text-3xl font-bold">No Playlists Yet</h2>

            <Button
              className="mt-8 rounded-full bg-red-600 px-8"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Playlist
            </Button>
          </div>
        ) : (
          playlists.map((playlist) => (
            <div
              key={playlist._id}
              onClick={() => navigate(`/playlists/${playlist._id}`)}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 transition-all hover:-translate-y-1 hover:border-slate-700 hover:shadow-xl hover:shadow-black/40"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={
                    playlist.thumbnail ||
                    "https://placehold.co/600x338/1e293b/ffffff?text=No+Thumbnail"
                  }
                  alt={playlist.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://placehold.co/600x338/1e293b/ffffff?text=No+Thumbnail";
                  }}
                />

                <div className="absolute bottom-4 right-4 rounded-xl bg-black/80 px-4 py-3 text-center">
                  <p className="text-3xl font-bold text-white">
                    {playlist.videoCount}
                  </p>

                  <p className="text-xs uppercase tracking-widest text-slate-300">
                    VIDEO{playlist.videoCount !== 1 && "S"}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-5">
                <div>
                  <h2 className="text-2xl font-bold">{playlist.name}</h2>

                  <p className="mt-2 text-slate-400">
                    {playlist.videoCount} video
                    {playlist.videoCount !== 1 && "s"}
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="rounded-full p-2 text-slate-500 hover:bg-slate-800 hover:text-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    <DropdownMenuItem
                      className="text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(playlist._id);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Playlist
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Playlist Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-3xl border border-slate-800 bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-3xl text-white">Create Playlist</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <input
              placeholder="Playlist Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-5 py-4 text-white placeholder:text-slate-500 focus:border-red-500 focus:outline-none"
            />

            <textarea
              rows={4}
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-5 text-white placeholder:text-slate-500 focus:border-red-500 focus:outline-none"
            />

            <Button
              className="h-12 w-full rounded-full bg-red-600 hover:bg-red-500"
              disabled={isCreating}
              onClick={async () => {
                await handleCreate();
              }}
            >
              {isCreating ? "Creating..." : "Create Playlist"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Playlists;
