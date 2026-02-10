import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../auth/auth.context.jsx";
import { useChat } from "../chat/useChat.js";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { api } from "../../shared/utils/axios.js";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, logout } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [roomUsers, setRoomUsers] = useState({});
  const [typingUsers, setTypingUsers] = useState({});

  const { activeRoom } = useChat();

  useEffect(() => {
    if (!user) return;

    const newSocket = io(import.meta.env.VITE_API_URL, {
      auth: { token: localStorage.getItem("accessToken") },
    });

    setSocket(newSocket);

    newSocket.on("connect_error", async (err) => {
      if (err.message === "AUTH_ERROR" || err.message === "NO_TOKEN") {
        try {
          const { data } = await api.post("/auth/refresh");

          const newToken = data.accessToken;
          localStorage.setItem("accessToken", newToken);

          newSocket.auth = { token: newToken };
          newSocket.connect();
        } catch (refreshErr) {
          console.error("Refresh failed", refreshErr);

          localStorage.removeItem("accessToken");
          await logout();
        }
      }
    });

    newSocket.on("connect", () => setIsConnected(true));
    newSocket.on("disconnect", () => setIsConnected(false));

    newSocket.on("room:join:error", (msg) => toast.error(msg));

    const handleOnlineUsers = (users) => setOnlineUsers(users);
    newSocket.on("onlineUsers", handleOnlineUsers);

    const handleRoomUsers = ({ roomName, users }) => {
      setRoomUsers((prev) => ({
        ...prev,
        [roomName]: users,
      }));
    };

    newSocket.on("room:users", handleRoomUsers);

    const handleTypingStart = ({ roomName, userId, username }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [roomName]: prev[roomName]?.some((u) => u.userId === userId)
          ? prev[roomName]
          : [...(prev[roomName] || []), { userId, username }],
      }));
    };

    const handleTypingStop = ({ roomName, userId }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [roomName]: (prev[roomName] || []).filter((u) => u.userId !== userId),
      }));
    };

    const handleCommandError = (message) => {
      toast.error(message);
    };

    const handleUnbanned = ({ roomName }) => {
      toast(`You were unbanned in #${roomName}`);
    };
    newSocket.on("room:unbanned", handleUnbanned);

    newSocket.on("command:error", handleCommandError);
    newSocket.on("typing:start", handleTypingStart);
    newSocket.on("typing:stop", handleTypingStop);

    return () => {
      newSocket.off("onlineUsers", handleOnlineUsers);
      newSocket.off("room:users", handleRoomUsers);
      newSocket.off("typing:start", handleTypingStart);
      newSocket.off("typing:stop", handleTypingStop);
      newSocket.off("command:error", handleCommandError);
      newSocket.off("room:unbanned", handleUnbanned);
      newSocket.disconnect();
      setSocket(null);
      setOnlineUsers([]);
      setRoomUsers({});
      setTypingUsers({});
    };
  }, [user, activeRoom]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        roomUsers,
        typingUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
