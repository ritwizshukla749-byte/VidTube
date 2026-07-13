import api from "../api/axios";

export const toggleVideoLike = async (videoId) => {
  const response = await api.post(`/likes/toggle/v/${videoId}`);
  return response.data.data;
};


export const getLikedVideos = async () => {
  const response = await api.get("/likes/videos");
  return response.data.data;
};

export const getLikeStatus = async (videoId) => {
  const response = await api.get(`/likes/status/${videoId}`);
  return response.data.data;
};

