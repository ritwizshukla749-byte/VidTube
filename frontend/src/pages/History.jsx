import { useEffect, useState } from "react";
import { getWatchHistory } from "../services/auth.services.js";
import VideoCard from "../components/video/VideoCard.jsx";

function History() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getWatchHistory();
        setVideos(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="mx-auto max-w-7xl p-8">
      <h1 className="mb-8 text-3xl font-bold text-white">Watch History</h1>

      {videos.length === 0 ? (
        <p className="text-slate-400">No watch history available.</p>
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

export default History;
