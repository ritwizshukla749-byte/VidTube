import { useEffect, useState } from "react";
import { getAllVideos } from "../services/video.services";
import VideoCard from "../components/video/VideoCard";

function Home() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await getAllVideos();
        setVideos(response.videos || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchVideos();
  }, []);

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