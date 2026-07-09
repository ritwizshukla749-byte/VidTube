import api from "../api/axios";

export const getVideoComments = async (videoId) => {
  const response = await api.get(`/comments/${videoId}`);
  return response.data.data;
};

export const addComment = async (videoId, content) => {
  const response = await api.post(`/comments/${videoId}`, { content });
  return response.data.data;
};
