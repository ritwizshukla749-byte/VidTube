import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Card } from "../ui/card.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar.jsx";
import { Badge } from "../ui/badge.jsx";
import { Button } from "../ui/button.jsx";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  toggleSubscription,
  getSubscribers,
} from "../../services/subscription.services.js";

function ChannelInfo({ owner }) {
  const user = useSelector((state) => state.auth.user);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const response = await getSubscribers(owner._id);
        setSubscriberCount(response.data.length);
        const subscribed = response.data.some(
          (sub) => sub.subscriber._id === user?._id,
        );
        setIsSubscribed(subscribed);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSubscribers();
  }, [owner, user?._id]);

  const handleSubscription = async () => {
    try {
      setIsSubscribing(true);
      await toggleSubscription(owner._id);

      const response = await getSubscribers(owner._id);
      setSubscriberCount(response.data.length);

      const subscribed = response.data.some(
        (sub) => sub.subscriber._id === user?._id,
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

  return (
    <Card className="mt-6 rounded-3xl border border-slate-800/70 bg-slate-900/70 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-5">
          <Avatar className="h-20 w-20 border border-slate-700">
            <AvatarImage
              src={owner.avatar}
              alt={owner.username}
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/100x100/1e293b/ffffff?text=User";
              }}
            />

            <AvatarFallback>
              {owner.fullName[0]}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center gap-3">
              <Link to={`/channel/${owner.username}`}>
                <h2 className="cursor-pointer text-2xl font-bold text-white transition hover:text-red-500">
                  {owner.fullName}
                </h2>
              </Link>

              <Badge className="rounded-full bg-slate-800 text-slate-300">
                Creator
              </Badge>
            </div>

            <p className="mt-1 text-slate-400">
              @{owner.username}
            </p>

            <p className="mt-3 text-sm text-slate-500">
              {subscriberCount} Subscriber{subscriberCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* RIGHT */}
        {user?._id !== owner._id && (
          <Button
            onClick={handleSubscription}
            disabled={isSubscribing}
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
    </Card>
  );
}

export default ChannelInfo;
