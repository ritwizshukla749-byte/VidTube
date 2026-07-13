import api from "../api/axios";

export const getVideoComments = async (videoId) => {
  const response = await api.get(`/comments/${videoId}`);
  return response.data.data;
};

export const addComment = async (videoId, content) => {
  const response = await api.post(`/comments/${videoId}`, { content });
  return response.data.data;
};

export const deleteComment = async (commentId) => {
  const response = await api.delete(`/comments/c/${commentId}`);
  return response.data;
};

export const updateComment = async (commentId, content) => {
  const response = await api.patch(`/comments/c/${commentId}`, {
    content,
  });

  return response.data;
};