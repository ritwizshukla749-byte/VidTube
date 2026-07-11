import api from "../api/axios.js";

export const getAllVideos = async (params = {}) => {
  const response = await api.get("/videos", {
    params,
  });
  return response.data.data;
};

export const getVideoById = async (videoId) => {
  const response = await api.get(`/videos/${videoId}`);
  return response.data.data;
};

export const publishVideo = async (formData) => {
  const response = await api.post("/videos", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
export const togglePublishStatus = async (videoId) => {
  const response = await api.patch(`/videos/${videoId}/publish-status`);

  return response.data.data;
};

export const deleteVideo = async (videoId) => {
  const response = await api.delete(`/videos/${videoId}`);

  return response.data;
};
export const updateVideo = async (videoId, formData) => {
  const response = await api.patch(`/videos/${videoId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
};