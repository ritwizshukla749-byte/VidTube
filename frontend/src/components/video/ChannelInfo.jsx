import { useSelector } from "react-redux";
import { Card } from "../ui/card.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar.jsx";
import { Badge } from "../ui/badge.jsx";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  toggleSubscription,
  getSubscribers,
} from "../../services/subscription.services.js";

function ChannelInfo({ owner }) {
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
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
  }, [owner]);
  const handleSubscription = async () => {
    try {
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
    }
  };
  const user = useSelector((state) => state.auth.user);
  return (
    <Card className="mt-6">
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-2">
            <p className="text-sm text-muted-foreground">
              {subscriberCount} Subscribers
            </p>

            {user?._id !== owner._id && (
              <button
                onClick={handleSubscription}
                className={`rounded-lg px-5 py-2 font-semibold transition ${
                  isSubscribed
                    ? "bg-slate-700 text-white hover:bg-slate-600"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </button>
            )}
          </div>
          <Avatar className="h-14 w-14">
            <AvatarImage src={owner.avatar} alt={owner.username} />

            <AvatarFallback>{owner.fullName[0]}</AvatarFallback>
          </Avatar>

          <div>
            <h2 className="text-lg font-semibold">{owner.fullName}</h2>

            <p className="text-sm text-muted-foreground">@{owner.username}</p>

            <Badge variant="secondary" className="mt-2">
              Creator
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default ChannelInfo;
