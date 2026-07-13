import api from "../api/axios.js";

export const toggleSubscription = async (channelId) => {
  const response = await api.post(`/subscriptions/${channelId}`);
  return response.data;
};

export const getSubscribers = async (channelId) => {
  const response = await api.get(`/subscriptions/subscribers/${channelId}`);
  return response.data;
};

export const getSubscribedChannels = async (subscriberId) => {
  const response = await api.get(`/subscriptions/subscribed/${subscriberId}`);
  return response.data;
};
