import { User } from "../modules/users/user.model.js";

export const userConnections = new Map();

export const roomPresence = new Map();

export const addUserConnection = (userId, username, socketId) => {
  if (!userConnections.has(userId)) {
    userConnections.set(userId, { username, sockets: new Set() });
  }
  userConnections.get(userId).sockets.add(socketId);
};

export const removeUserConnection = async (userId, socketId) => {
  if (!userConnections.has(userId)) return;

  const data = userConnections.get(userId);
  data.sockets.delete(socketId);

  if (data.sockets.size === 0) {
    userConnections.delete(userId);

    await User.findByIdAndUpdate(userId, {
      status: "offline",
      lastSeen: new Date(),
    });
  }
};

export const isUserOnline = (userId) => userConnections.has(userId);

export const getUsername = (userId) => {
  const data = userConnections.get(userId);
  return data?.username || "Unknown";
};

export const addUserToRoom = (roomName, userId) => {
  if (!roomPresence.has(roomName)) {
    roomPresence.set(roomName, new Map());
  }

  const room = roomPresence.get(roomName);
  room.set(userId, (room.get(userId) || 0) + 1);
};

export const removeUserFromRoom = (roomName, userId) => {
  if (!roomPresence.has(roomName)) return;
  const users = roomPresence.get(roomName);
  if (!users.has(userId)) return;

  const count = users.get(userId) - 1;
  if (count <= 0) {
    users.delete(userId);
  } else {
    users.set(userId, count);
  }

  if (users.size === 0) roomPresence.delete(roomName);
};

export const getRoomUsers = (roomName) => {
  const room = roomPresence.get(roomName);
  if (!room) return [];

  return Array.from(room.keys()).map((userId) => ({
    userId,
    username: getUsername(userId),
  }));
};
