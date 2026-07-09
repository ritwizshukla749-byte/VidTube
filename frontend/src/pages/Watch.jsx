import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import VideoPlayer from "../components/video/VideoPlayer.jsx";
import { getVideoById } from "../services/video.services.js";

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
    <div className="mx-auto max-w-7xl">
      <VideoPlayer video={video} />

      <h1 className="mt-5 text-3xl font-bold">{video.title}</h1>

      <div className="mt-4 flex items-center gap-3">
        <img src={video.owner.avatar} className="h-12 w-12 rounded-full" />

        <div>
          <h2>{video.owner.fullName}</h2>

          <p className="text-sm text-slate-400">{video.views} views</p>
        </div>
      </div>

      <p className="mt-6 text-slate-300">{video.description}</p>
    </div>
  );
}

export default Watch;
