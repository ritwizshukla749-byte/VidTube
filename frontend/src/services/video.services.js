import api from "../api/axios.js";

export const getAllVideos = async () => {
  const response = await api.get("/videos");
  return response.data.data;
};

export const getVideoById = async (videoId) => {
  const response = await api.get(`/videos/${videoId}`);
  return response.data.data;
};
