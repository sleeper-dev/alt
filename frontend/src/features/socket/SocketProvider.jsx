import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../auth/auth.context.jsx";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [roomUsers, setRoomUsers] = useState({});
  const [typingUsers, setTypingUsers] = useState({});

  useEffect(() => {
    if (!user) return;

    const newSocket = io(import.meta.env.VITE_API_URL, {
      auth: { token: localStorage.getItem("accessToken") },
    });

    setSocket(newSocket);

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

    newSocket.on("typing:start", handleTypingStart);
    newSocket.on("typing:stop", handleTypingStop);

    return () => {
      newSocket.off("onlineUsers", handleOnlineUsers);
      newSocket.off("room:users", handleRoomUsers);
      newSocket.off("typing:start", handleTypingStart);
      newSocket.off("typing:stop", handleTypingStop);
      newSocket.disconnect();
      setSocket(null);
      setOnlineUsers([]);
      setRoomUsers({});
      setTypingUsers({});
    };
  }, [user]);

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
