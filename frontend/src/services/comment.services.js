import api from "../api/axios";

export const getVideoComments = async (videoId) => {
  const response = await api.get(`/comments/${videoId}`);
  return response.data.data;
};
