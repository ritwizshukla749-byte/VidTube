import api from "../api/axios.js";

export const createPlaylist = async (data) => {
  const response = await api.post("/playlists", data);
  return response.data.data;
};

export const getUserPlaylists = async (userId) => {
  const response = await api.get(`/playlists/user/${userId}`);
  return response.data.data;
};

export const getPlaylistById = async (playlistId) => {
  const response = await api.get(`/playlists/${playlistId}`);
  return response.data.data;
};

export const updatePlaylist = async (playlistId, data) => {
  const response = await api.patch(`/playlists/${playlistId}`, data);
  return response.data.data;
};

export const deletePlaylist = async (playlistId) => {
  const response = await api.delete(`/playlists/${playlistId}`);
  return response.data;
};

export const addVideoToPlaylist = async (playlistId, videoId) => {
  const response = await api.patch(`/playlists/add/${playlistId}/${videoId}`);

  return response.data.data;
};

export const removeVideoFromPlaylist = async (playlistId, videoId) => {
  const response = await api.patch(
    `/playlists/remove/${playlistId}/${videoId}`,
  );

  return response.data.data;
};
