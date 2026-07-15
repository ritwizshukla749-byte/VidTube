import { useEffect, useState } from "react";
import { getWatchHistory } from "../services/auth.services.js";
import VideoCard from "../components/video/VideoCard.jsx";
import { Helmet } from "react-helmet-async";

function History() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await getWatchHistory();
        setVideos(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-10 py-10">
      <Helmet>
        <title>Watch History | VidTube</title>
      </Helmet>

      {/* Header */}
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-extrabold text-white">Watch History</h1>

          <p className="mt-2 text-slate-400">Recently Watched</p>
        </div>
      </div>

      <div className="mb-10 border-b border-slate-800"></div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video rounded-2xl bg-slate-800" />

              <div className="mt-3 flex gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-800" />

                <div className="flex-1 space-y-2">
                  <div className="h-4 rounded bg-slate-800" />

                  <div className="h-3 w-2/3 rounded bg-slate-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="col-span-full flex flex-col items-center rounded-3xl border border-dashed border-slate-700 py-24">
          <p className="text-5xl">🕐</p>

          <h2 className="mt-4 text-3xl font-bold">No watch history yet</h2>

          <p className="mt-2 text-slate-400">
            Start watching videos to build your history.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}

export default History;
