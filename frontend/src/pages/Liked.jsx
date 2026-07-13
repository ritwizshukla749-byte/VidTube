import { useEffect, useState } from "react";
import { getLikedVideos } from "../services/like.services.js";
import VideoCard from "../components/video/VideoCard.jsx";

function Liked() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchLikedVideos = async () => {
      try {
        const response = await getLikedVideos();

        const liked = response.map((item) => item.video);

        setVideos(liked);
      } catch (error) {
        console.error(error);
      }
    };

    fetchLikedVideos();
  }, []);

  return (
    <div className="mx-auto max-w-7xl p-8">
      <h1 className="mb-8 text-3xl font-bold text-white">Liked Videos</h1>

      {videos.length === 0 ? (
        <p className="text-slate-400">You haven't liked any videos yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Liked;
