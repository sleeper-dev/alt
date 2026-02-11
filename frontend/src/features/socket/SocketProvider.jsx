import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/auth.context.jsx";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { api } from "../../shared/utils/axios.js";
import { useChat } from "../chat/chat.context.jsx";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, logout } = useAuth();
  const { activeRoom, setActiveRoom, setRooms } = useChat();

  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [roomUsers, setRoomUsers] = useState({});
  const [typingUsers, setTypingUsers] = useState({});

  const activeRoomRef = useRef(activeRoom);

  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);

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
          localStorage.removeItem("accessToken");
          await logout();
        }
      }
    });

    newSocket.on("connect", () => setIsConnected(true));
    newSocket.on("disconnect", () => setIsConnected(false));

    newSocket.on("room:join:error", (msg) => toast.error(msg));

    newSocket.on("onlineUsers", setOnlineUsers);

    newSocket.on("room:users", ({ roomName, users }) => {
      setRoomUsers((prev) => ({
        ...prev,
        [roomName]: users,
      }));
    });

    newSocket.on("typing:start", ({ roomName, userId, username }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [roomName]: prev[roomName]?.some((u) => u.userId === userId)
          ? prev[roomName]
          : [...(prev[roomName] || []), { userId, username }],
      }));
    });

    newSocket.on("typing:stop", ({ roomName, userId }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [roomName]: (prev[roomName] || []).filter((u) => u.userId !== userId),
      }));
    });

    newSocket.on("room:left", ({ room }) => {
      if (activeRoomRef.current?.name === room) {
        setActiveRoom(null);
      }
    });

    newSocket.on("room:deleted", ({ roomName }) => {
      setRooms((prev) => prev.filter((r) => r.name !== roomName));

      if (activeRoomRef.current?.name === roomName) {
        setActiveRoom(null);
      }

      toast(`Room ${roomName} deleted`);
    });

    newSocket.on("room:banned", ({ roomName }) => {
      toast(`You were banned from #${roomName}`, {
        icon: "⚠️",
      });

      if (activeRoomRef.current?.name === roomName) {
        newSocket.emit("room:leave");
        setActiveRoom(null);
      }
    });

    newSocket.on("room:unbanned", ({ roomName }) => {
      toast(`You were unbanned in #${roomName}`);
    });

    newSocket.on("command:error", (msg) => toast.error(msg));

    return () => {
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
