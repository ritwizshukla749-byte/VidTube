import { useEffect, useState } from "react";
import { getLikedVideos } from "../services/like.services.js";
import VideoCard from "../components/video/VideoCard.jsx";
import { Helmet } from "react-helmet-async";

function Liked() {
  const [likedVideos, setLikedVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedVideos = async () => {
      try {
        setLoading(true);
        const response = await getLikedVideos();
        setLikedVideos(response);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedVideos();
  }, []);

  const validLikes = likedVideos.filter((like) => like.video);

  return (
    <div className="mx-auto max-w-7xl px-10 py-10">
      <Helmet>
        <title>Liked Videos | VidTube</title>
      </Helmet>

      {/* Header */}
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-extrabold text-white">Liked Videos</h1>

          <p className="mt-2 text-slate-400">
            {validLikes.length} liked video{validLikes.length !== 1 && "s"}
          </p>
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
      ) : validLikes.length === 0 ? (
        <div className="col-span-full flex flex-col items-center rounded-3xl border border-dashed border-slate-700 py-24">
          <p className="text-5xl">❤️</p>

          <h2 className="mt-4 text-3xl font-bold">No liked videos yet</h2>

          <p className="mt-2 text-slate-400">
            Videos you like will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {validLikes.map((like) => (
            <VideoCard key={like.video._id} video={like.video} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Liked;
