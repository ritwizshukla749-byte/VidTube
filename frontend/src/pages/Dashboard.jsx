import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EditVideoDialog from "../components/dashboard/EditVideoDialog";
import DashboardStats from "../components/dashboard/DashboardStats";
import { togglePublishStatus, deleteVideo } from "../services/video.services";
import toast from "react-hot-toast";
import {
  getChannelStats,
  getChannelVideos,
} from "../services/dashboard.services";
import DashboardTable from "../components/dashboard/DashboardTable";
import { Helmet } from "react-helmet-async";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const navigate = useNavigate();
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
  const handleTogglePublish = async (videoId) => {
    try {
      const updatedVideo = await togglePublishStatus(videoId);

      setVideos((prevVideos) =>
        prevVideos.map((video) =>
          video._id === updatedVideo._id ? updatedVideo : video,
        ),
      );

      toast.success("Publish status updated");
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Failed to update publish status",
      );
    }
  };
  const handleDeleteVideo = async (videoId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this video?",
    );

    if (!confirmed) return;

    try {
      await deleteVideo(videoId);

      setVideos((prevVideos) =>
        prevVideos.filter((video) => video._id !== videoId),
      );

      setStats((prevStats) => ({
        ...prevStats,
        totalVideos: prevStats.totalVideos - 1,
      }));

      toast.success("Video deleted successfully");
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to delete video");
    }
  };
  const handleEdit = (video) => {
    setSelectedVideo(video);
    setEditOpen(true);
  };
  if (!stats) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-slate-700 border-t-red-500" />
      </div>
    );
  }

  const handleVideoUpdated = (updatedVideo) => {
    setVideos((prevVideos) =>
      prevVideos.map((video) =>
        video._id === updatedVideo._id ? updatedVideo : video,
      ),
    );

    setEditOpen(false);

    setSelectedVideo(null);
  };
  return (
    <>
      <div className="mx-auto max-w-7xl px-10 py-10">
      <Helmet>
        <title>Dashboard | VidTube</title>
      </Helmet>
      <div className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-1 text-sm font-medium text-red-400">
            Creator Studio
          </span>

          <h1 className="mt-5 text-5xl font-extrabold text-white">
            Welcome back.
          </h1>

          <p className="mt-3 max-w-xl text-lg leading-relaxed text-slate-400">
            Manage your uploads, monitor engagement, and keep your audience growing.
          </p>
        </div>

        <button
          onClick={() => navigate("/upload")}
          className="rounded-2xl bg-gradient-to-r from-red-600 to-red-500 px-6 py-3 text-base font-semibold shadow-lg shadow-red-900/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-red-700/40 lg:px-8 lg:py-4 lg:text-lg"
        >
          + Upload Video
        </button>
      </div>
      <DashboardStats stats={stats} />

      <div className="mb-5 mt-10">
        <h2 className="text-3xl font-bold">
          Recent Uploads
        </h2>

        <p className="mt-2 text-slate-400">
          Manage your published and private videos.
        </p>
      </div>

      <DashboardTable
        videos={videos}
        onTogglePublish={handleTogglePublish}
        onDelete={handleDeleteVideo}
        onEdit={handleEdit}
      />
      <EditVideoDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        video={selectedVideo}
        onVideoUpdated={handleVideoUpdated}
      />
      </div>
    </>
  );
}

export default Dashboard;
