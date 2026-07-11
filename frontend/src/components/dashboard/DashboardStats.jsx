import { Card, CardContent } from "@/components/ui/card";
import { Video, Eye, Heart, Users } from "lucide-react";

function DashboardStats({ stats }) {
  const cards = [
    {
      title: "Videos",
      value: stats.totalVideos,
      icon: Video,
    },
    {
      title: "Views",
      value: stats.totalViews,
      icon: Eye,
    },
    {
      title: "Likes",
      value: stats.totalLikes,
      icon: Heart,
    },
    {
      title: "Subscribers",
      value: stats.totalSubscribers,
      icon: Users,
    },
  ];

  return (
    <div className="mb-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.title}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-slate-400">{card.title}</p>

                <h2 className="mt-2 text-4xl font-bold">{card.value}</h2>
              </div>

              <Icon className="h-10 w-10 text-red-500" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default DashboardStats;
