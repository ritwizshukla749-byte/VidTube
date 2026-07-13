import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getChannelProfile } from "../services/auth.services.js";
import { getSubscribers } from "../services/subscription.services.js";

import { getVideosByUser } from "../services/video.services.js";
import VideoCard from "../components/video/VideoCard.jsx";

function Channel() {
  const { username } = useParams();

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [subscriberCount, setSubscriberCount] = useState(0);

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const profile = await getChannelProfile(username);
        setChannel(profile.data);

        const subscribers = await getSubscribers(profile.data._id);
        setSubscriberCount(subscribers.data.length);
        const uploadedVideos = await getVideosByUser(profile.data._id);
        setVideos(uploadedVideos);
      } catch (err) {
        console.error(err);
      }
    };

    fetchChannel();
  }, [username]);

  if (!channel) {
    return <div className="p-10 text-center text-white">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl p-8">
      {/* Channel Header */}
      <div className="flex items-center gap-6 rounded-xl bg-slate-900 p-6">
        <img
          src={channel.avatar}
          alt={channel.username}
          className="h-28 w-28 rounded-full object-cover"
        />

        <div>
          <h1 className="text-3xl font-bold text-white">{channel.fullName}</h1>

          <p className="text-slate-400">@{channel.username}</p>

          <p className="mt-2 text-slate-300">{subscriberCount} Subscribers</p>
        </div>
      </div>

      {/* Videos */}
      <div className="mt-10">
        <h2 className="mb-6 text-2xl font-bold text-white">Videos</h2>

        {videos.length === 0 ? (
          <p className="text-slate-400">No videos uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Channel;
