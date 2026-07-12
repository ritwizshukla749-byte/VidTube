import { useEffect, useState } from "react";
import { getAllVideos } from "../services/video.services";
import VideoCard from "../components/video/VideoCard";
import { useSelector } from "react-redux";
function Home() {
  const [videos, setVideos] = useState([]);
  const { query } = useSelector((state) => state.search);
  console.log("Search Query:", query);
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const response = await getAllVideos({
          query,
        });

        setVideos(response.videos);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <>
      <h1 className="mb-8 text-3xl font-bold">Discover Videos</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
        {videos.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-20">
            <h2 className="text-2xl font-semibold">No videos found</h2>

            <p className="mt-2 text-slate-400">Try another search keyword.</p>
          </div>
        ) : (
          videos.map((video) => <VideoCard key={video._id} video={video} />)
        )}
      </div>
    </>
  );
}

export default Home;