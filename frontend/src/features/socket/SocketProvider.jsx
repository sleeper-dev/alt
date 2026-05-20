import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { api } from "../../shared/utils/axios.js";
import { useAuth } from "../auth/auth.context.jsx";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, logout } = useAuth();

  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [roomUsers, setRoomUsers] = useState({});

  useEffect(() => {
    if (!user) return;

    const newSocket = io(import.meta.env.VITE_API_URL, {
      auth: {
        token: localStorage.getItem("accessToken"),
      },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("connect_error", async (err) => {
      if (err.message === "AUTH_ERROR" || err.message === "NO_TOKEN") {
        try {
          const { data } = await api.post("/auth/refresh");

          const newToken = data.accessToken;

          localStorage.setItem("accessToken", newToken);

          newSocket.auth = {
            token: newToken,
          };

          newSocket.connect();
        } catch (refreshErr) {
          localStorage.removeItem("accessToken");

          await logout();
        }
      }
    });

    newSocket.on("room:join:error", (msg) => {
      toast.error(msg);
    });

    newSocket.on("command:error", (msg) => {
      toast.error(msg);
    });

    newSocket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    newSocket.on("room:users", ({ roomName, users }) => {
      console.log("ROOM USERS", roomName, users);
      setRoomUsers((prev) => ({
        ...prev,
        [roomName]: users,
      }));
    });

    newSocket.on("room:deleted", ({ roomName }) => {
      toast(`Room #${roomName} deleted`);
    });

    newSocket.on("room:banned", ({ roomName }) => {
      toast(`You were banned from #${roomName}`, {
        icon: "⚠️",
      });
    });

    newSocket.on("room:kicked", ({ roomName }) => {
      toast.error(`You were kicked from #${roomName}`);
    });

    newSocket.on("room:unbanned", ({ roomName }) => {
      toast(`You were unbanned in #${roomName}`);
    });

    return () => {
      newSocket.disconnect();

      setSocket(null);

      setIsConnected(false);

      setOnlineUsers([]);
      setRoomUsers({});
    };
  }, [user, logout]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,

        onlineUsers,
        roomUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
