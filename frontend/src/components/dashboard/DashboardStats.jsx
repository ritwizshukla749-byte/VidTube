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
    <div className="mb-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.title}
            className="rounded-3xl border border-slate-800/80 bg-slate-900/80 shadow-xl backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:border-red-500/40 hover:shadow-red-900/20"
          >
            <CardContent className="relative overflow-hidden rounded-3xl p-7">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wider text-slate-400">
                    {card.title}
                  </p>

                  <h2 className="mt-4 text-5xl font-black text-white">
                    {card.value}
                  </h2>

                  <p className="mt-3 text-sm text-emerald-400">
                    Active
                  </p>
                </div>

                <div className="rounded-2xl bg-red-500/10 p-4">
                  <Icon className="h-8 w-8 text-red-500" />
                </div>
              </div>

              <div className="mt-8 h-[2px] w-full rounded-full bg-gradient-to-r from-red-500 via-red-400 to-transparent opacity-70" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default DashboardStats;
