import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import VideoPlayer from "../components/video/VideoPlayer.jsx";
import { getVideoById } from "../services/video.services.js";
import VideoMeta from "../components/video/VideoMeta.jsx";
import ChannelInfo from "../components/video/ChannelInfo.jsx";
import VideoActions from "../components/video/VideoActions.jsx";
import SuggestedVideos from "../components/video/SuggestedVideos";
import CommentSection from "../components/comment/CommentSection.jsx";

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
   return (
     <div className="mx-auto max-w-7xl animate-pulse">
       <div className="aspect-video rounded-xl bg-slate-800" />

       <div className="mt-6 h-10 w-2/3 rounded bg-slate-800" />

       <div className="mt-6 flex items-center gap-4">
         <div className="h-12 w-12 rounded-full bg-slate-800" />

         <div className="space-y-2">
           <div className="h-4 w-40 rounded bg-slate-800" />
           <div className="h-4 w-24 rounded bg-slate-800" />
         </div>
       </div>

       <div className="mt-6 space-y-3">
         <div className="h-4 rounded bg-slate-800" />
         <div className="h-4 rounded bg-slate-800" />
         <div className="h-4 w-3/4 rounded bg-slate-800" />
       </div>
     </div>
   );
 }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <VideoPlayer video={video} />

        <VideoMeta video={video} />

        <VideoActions videoId={video._id} />
        <ChannelInfo owner={video.owner} />
        <CommentSection videoId={video._id} />
      </div>

      <SuggestedVideos currentVideoId={video._id} />
    </div>
  );
}

export default Watch;
