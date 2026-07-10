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
      <h1 className="mb-6 text-3xl font-bold">
        Home Feed
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

        {videos.map((video) => (
          <VideoCard
            key={video._id}
            video={video}
          />
        ))}

      </div>
    </>
  );
}

export default Home;