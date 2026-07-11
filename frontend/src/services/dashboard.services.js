import api from "../api/axios";

export const getChannelStats = async () => {
  const response = await api.get("/dashboard/stats");
  return response.data.data;
};

export const getChannelVideos = async () => {
  const response = await api.get("/dashboard/videos");
  return response.data.data;
};
