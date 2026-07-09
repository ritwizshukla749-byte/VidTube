import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import VideoPlayer from "../components/video/VideoPlayer.jsx";
import { getVideoById } from "../services/video.services.js";
import VideoMeta from "../components/video/VideoMeta.jsx";
import ChannelInfo from "../components/video/ChannelInfo.jsx";
import VideoActions from "../components/video/VideoActions.jsx";
import SuggestedVideos from "../components/video/SuggestedVideos";
function Watch() {
  const { videoId } = useParams();

  const [video, setVideo] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const data = await getVideoById(videoId);
        setVideo(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchVideo();
  }, [videoId]);

  if (!video) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <VideoPlayer video={video} />

        <VideoMeta video={video} />

        <VideoActions videoId={video._id} />
        <ChannelInfo owner={video.owner} />
      </div>

      <SuggestedVideos currentVideoId={video._id} />
    </div>
  );
}

export default Watch;
