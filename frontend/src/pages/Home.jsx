import { useEffect, useState } from "react";
import { getAllVideos } from "../services/video.services";
import VideoCard from "../components/video/VideoCard";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
function Home() {
  const [videos, setVideos] = useState([]);
  const { query } = useSelector((state) => state.search);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await getAllVideos({
          query,
        });

        setVideos(response.videos);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="mx-auto max-w-7xl px-10 py-10">
      <Helmet>
        <title>Home | VidTube</title>
      </Helmet>

      <div className="mb-12">
        <h1 className="text-5xl font-extrabold text-white">
          Discover Videos
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
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
          ))
        ) : videos.length === 0 ? (
          <div className="col-span-full flex flex-col items-center rounded-3xl border border-dashed border-slate-700 py-24">
            <p className="text-5xl">🎬</p>

            <h2 className="mt-4 text-3xl font-bold">No videos found</h2>

            <p className="mt-2 text-slate-400">Try another search keyword.</p>
          </div>
        ) : (
          videos.map((video) => <VideoCard key={video._id} video={video} />)
        )}
      </div>
    </div>
  );
}

export default Home;
