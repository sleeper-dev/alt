import { api } from "../../shared/utils/axios.js";

export const getRooms = async () => {
  const { data } = await api.get("/rooms");
  return data;
};

export const createRoom = async (roomData) => {
  const { data } = await api.post("/rooms", roomData);
  return data;
};
