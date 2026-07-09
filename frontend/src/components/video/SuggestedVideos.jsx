import { useEffect, useState } from "react";
import { getAllVideos } from "../../services/video.services";
import SuggestedVideoCard from "./SuggestedVideoCard";

function SuggestedVideos({ currentVideoId }) {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      const response = await getAllVideos();

      const filtered = response.videos.filter(
        (video) => video._id !== currentVideoId,
      );

      setVideos(filtered);
    };

    fetchVideos();
  }, [currentVideoId]);

  return (
    <div className="space-y-3">
      <h2 className="mb-4 text-lg font-bold">Suggested Videos</h2>

      {videos.map((video) => (
        <SuggestedVideoCard key={video._id} video={video} />
      ))}
    </div>
  );
}

export default SuggestedVideos;
