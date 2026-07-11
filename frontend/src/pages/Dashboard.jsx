import { useEffect, useState } from "react";
import EditVideoDialog from "../components/dashboard/EditVideoDialog";
import DashboardStats from "../components/dashboard/DashboardStats";
import { togglePublishStatus, deleteVideo } from "../services/video.services";
import toast from "react-hot-toast";
import {
  getChannelStats,
  getChannelVideos,
} from "../services/dashboard.services";
import { Button } from "@/components/ui/button";
import DashboardTable from "../components/dashboard/DashboardTable";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
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
    return <h1>Loading...</h1>;
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
      <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>
      <DashboardStats stats={stats} />
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
    </>
  );
}

export default Dashboard;
