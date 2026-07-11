import { useEffect, useState } from "react";

import {
  getChannelStats,
  getChannelVideos,
} from "../services/dashboard.services";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const statsResponse = await getChannelStats();
        const videosResponse = await getChannelVideos();

        setStats(statsResponse);
        setVideos(videosResponse);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDashboard();
  }, []);

  if (!stats) {
    return <h1>Loading...</h1>;
  }

  return (
    <>
      <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>
      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-slate-900 p-6">
          <h2 className="text-slate-400">Videos</h2>
          <p className="mt-2 text-4xl font-bold text-white">
            {stats.totalVideos}
          </p>
        </div>

        <div className="rounded-xl bg-slate-900 p-6">
          <h2 className="text-slate-400">Views</h2>
          <p className="mt-2 text-4xl font-bold text-white">
            {stats.totalViews}
          </p>
        </div>

        <div className="rounded-xl bg-slate-900 p-6">
          <h2 className="text-slate-400">Subscribers</h2>
          <p className="mt-2 text-4xl font-bold text-white">
            {stats.totalSubscribers}
          </p>
        </div>

        <div className="rounded-xl bg-slate-900 p-6">
          <h2 className="text-slate-400">Likes</h2>
          <p className="mt-2 text-4xl font-bold text-white">
            {stats.totalLikes}
          </p>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl bg-slate-900">
        <table className="w-full">
          <thead className="bg-slate-800">
            <tr>
              <th className="p-4 text-left">Thumbnail</th>

              <th className="p-4 text-left">Title</th>

              <th className="p-4 text-left">Views</th>

              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {videos.map((video) => (
              <tr key={video._id} className="border-t border-slate-800">
                <td className="p-4">
                  <img
                    src={video.thumbnail}
                    className="h-16 w-28 rounded-lg object-cover"
                  />
                </td>

                <td className="p-4">{video.title}</td>

                <td className="p-4">{video.views}</td>

                <td className="p-4">
                  {video.isPublished ? "Public" : "Private"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Dashboard;
