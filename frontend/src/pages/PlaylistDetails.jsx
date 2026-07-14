import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {Button} from "../components/ui/button";
import { getPlaylistById, removeVideoFromPlaylist } from "../services/playlist.services.js";
import VideoCard from "../components/video/VideoCard.jsx";
import toast from "react-hot-toast";


function PlaylistDetails() {
  const { playlistId } = useParams();

  const [playlist, setPlaylist] = useState(null);

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
    return <div className="p-10 text-center text-white">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl p-8">
      <h1 className="text-3xl font-bold text-white">{playlist.name}</h1>

      <p className="mt-2 text-slate-400">{playlist.description}</p>

      <p className="mt-3 text-slate-500">{playlist.videos.length} Videos</p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {playlist.videos.length === 0 ? (
          <p className="text-slate-400">This playlist is empty.</p>
        ) : (
          playlist.videos.map((video) => (
            <div key={video._id}>
              <VideoCard video={video} />

              <Button
                variant="destructive"
                className="mt-2 w-full"
                onClick={() => handleRemove(video._id)}
              >
                Remove from Playlist
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PlaylistDetails;
