import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { getChannelProfile } from "../services/auth.services.js";
import {
  getSubscribers,
  toggleSubscription,
} from "../services/subscription.services.js";

import { getVideosByUser } from "../services/video.services.js";
import VideoCard from "../components/video/VideoCard.jsx";
import { Helmet } from "react-helmet-async";
import { Button } from "../components/ui/button.jsx";
import { Badge } from "../components/ui/badge.jsx";
import toast from "react-hot-toast";

function Channel() {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useSelector((state) => state.auth);

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const profile = await getChannelProfile(username);
        setChannel(profile.data);

        const subscribers = await getSubscribers(profile.data._id);
        setSubscriberCount(subscribers.data.length);

        const subscribed = subscribers.data.some(
          (sub) => sub.subscriber._id === currentUser?._id,
        );
        setIsSubscribed(subscribed);

        const uploadedVideos = await getVideosByUser(profile.data._id);
        setVideos(uploadedVideos);
      } catch (err) {
        console.error(err);
      }
    };

    fetchChannel();
  }, [username, currentUser?._id]);

  const handleSubscribe = async () => {
    if (!channel) return;
    if (!isAuthenticated) {
      toast.error("Please log in to subscribe");
      return;
    }
    try {
      setIsSubscribing(true);
      await toggleSubscription(channel._id);

      const subscribers = await getSubscribers(channel._id);
      setSubscriberCount(subscribers.data.length);

      const subscribed = subscribers.data.some(
        (sub) => sub.subscriber._id === currentUser?._id,
      );
      setIsSubscribed(subscribed);

      toast.success(
        subscribed ? "Subscribed successfully" : "Unsubscribed successfully",
      );
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Subscription failed");
    } finally {
      setIsSubscribing(false);
    }
  };

  if (!channel) {
    return (
      <div className="mx-auto max-w-7xl px-10 py-10">
        <div className="flex flex-col items-center gap-4 py-24 text-white">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-slate-700 border-t-red-500" />
          <p className="text-slate-400">Loading channel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-10 py-10">
      <Helmet>
        <title>{channel.username} | VidTube</title>
      </Helmet>
      {" "}
      {/* Channel Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-[#0b1022] to-slate-900 p-10 shadow-2xl">
        {/* Background Glows */}
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-red-600/10 blur-3xl" />

        <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-8">
            <img
              src={channel.avatar}
              alt={channel.username}
              className="h-36 w-36 rounded-full border-4 border-white/10 object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/600x338/1e293b/ffffff?text=No+Image";
              }}
            />

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-5xl font-extrabold text-white">
                  {channel.fullName}
                </h1>

                <Badge className="rounded-full border border-slate-700 bg-slate-800 px-4 py-1 text-sm">
                  ✓ Creator
                </Badge>
              </div>

              <p className="mt-1 text-lg text-slate-400">
                @{channel.username}
              </p>

              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <span>{subscriberCount} Subscriber{subscriberCount !== 1 ? "s" : ""}</span>

                <span>•</span>

                <span>{videos.length} Video{videos.length !== 1 ? "s" : ""}</span>

                <span>•</span>

                <span>
                  Joined{" "}
                  {new Date(channel.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {currentUser?._id !== channel._id && (
              <Button
                disabled={isSubscribing}
                onClick={handleSubscribe}
                className={`rounded-full px-8 py-6 text-base font-semibold transition ${
                  isSubscribed
                    ? "bg-slate-700 hover:bg-slate-600"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isSubscribing
                  ? "Loading..."
                  : isSubscribed
                    ? "Subscribed"
                    : "Subscribe"}
              </Button>
            )}
          </div>
        </div>
      </div>
      {/* Videos */}
      <div className="mt-10">
        <div className="mb-8">
          <h2 className="text-4xl font-bold">Latest Videos</h2>

          <p className="mt-2 text-slate-400">
            Latest uploads from this creator.
          </p>
        </div>

        {videos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 py-20 text-center">
            <p className="text-4xl">📹</p>

            <h2 className="mt-4 text-2xl font-bold">No videos uploaded yet</h2>

            <p className="mt-3 text-slate-400">
              Once this creator uploads videos, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
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
