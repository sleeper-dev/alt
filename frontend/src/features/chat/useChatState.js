import { useEffect, useRef, useState } from "react";
import { createRoom, getRooms } from "../rooms/rooms.api.js";
import toast from "react-hot-toast";
import { useSocket } from "../socket/SocketProvider.jsx";

export const useChatState = () => {
  const { socket } = useSocket();

  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);

  const [loadingRooms, setLoadingRooms] = useState(true);
  const [roomsError, setRoomsError] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDesc, setNewRoomDesc] = useState("");

  const [isPrivate, setIsPrivate] = useState(false);
  const [roomPassword, setRoomPassword] = useState("");

  const [creating, setCreating] = useState(false);

  const [typingUsers, setTypingUsers] = useState({});

  const roomsRef = useRef(rooms);

  useEffect(() => {
    roomsRef.current = rooms;
  }, [rooms]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await getRooms();

        setRooms(data);
      } catch (err) {
        setRoomsError("Failed to load rooms");
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleRoomJoined = ({ room }) => {
      console.log("JOINED EVENT:", room);

      const joinedRoom = roomsRef.current.find((r) => r.name === room);

      if (joinedRoom) {
        setActiveRoom(joinedRoom);
      }
    };

    const handleRoomLeft = ({ room }) => {
      setActiveRoom((prev) => {
        if (prev?.name === room) {
          return null;
        }

        return prev;
      });
    };

    const handleRoomDeleted = ({ roomName }) => {
      setRooms((prev) => prev.filter((r) => r.name !== roomName));

      setActiveRoom((prev) => {
        if (prev?.name === roomName) {
          return null;
        }

        return prev;
      });
    };

    const handleRoomUpdated = ({ room }) => {
      setRooms((prev) =>
        prev.map((r) =>
          r._id === room._id
            ? {
                ...r,
                isPrivate: room.isPrivate,
                description: room.description,
                name: room.name,
              }
            : r,
        ),
      );

      setActiveRoom((prev) => {
        if (!prev) return prev;

        if (prev._id === room._id) {
          return {
            ...prev,
            ...room,
          };
        }

        return prev;
      });
    };

    const handleRoomKicked = ({ roomName }) => {
      setActiveRoom((prev) => {
        if (prev?.name === roomName) {
          return null;
        }

        return prev;
      });
    };

    const handleRoomBanned = ({ roomName }) => {
      setActiveRoom((prev) => {
        if (prev?.name === roomName) {
          return null;
        }

        return prev;
      });
    };

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

    socket.on("room:joined", handleRoomJoined);
    socket.on("room:left", handleRoomLeft);
    socket.on("room:deleted", handleRoomDeleted);
    socket.on("room:updated", handleRoomUpdated);
    socket.on("room:kicked", handleRoomKicked);
    socket.on("room:banned", handleRoomBanned);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    return () => {
      socket.off("room:joined", handleRoomJoined);
      socket.off("room:left", handleRoomLeft);
      socket.off("room:deleted", handleRoomDeleted);
      socket.off("room:updated", handleRoomUpdated);
      socket.off("room:kicked", handleRoomKicked);
      socket.off("room:banned", handleRoomBanned);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
    };
  }, [socket, rooms]);

  const joinRoom = (roomName, password = "") => {
    if (!socket) return;

    if (activeRoom?.name === roomName) return;

    console.log("EMIT JOIN:", roomName);

    socket.emit("room:join", {
      roomName,
      password,
    });
  };

  const leaveRoom = () => {
    if (!socket || !activeRoom) return;

    socket.emit("room:leave");
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();

    if (!newRoomName.trim()) return;

    if (isPrivate && !roomPassword.trim()) {
      toast.error("Private rooms require a password!");

      return;
    }

    try {
      setCreating(true);

      const newRoom = await createRoom({
        name: newRoomName.trim(),
        description: newRoomDesc.trim(),
        isPrivate,
        password: isPrivate ? roomPassword.trim() : undefined,
      });

      setRooms((prev) => [...prev, newRoom]);

      socket?.emit("room:join", {
        roomName: newRoom.name,
        password: isPrivate ? roomPassword.trim() : "",
      });

      setNewRoomName("");
      setNewRoomDesc("");

      setIsPrivate(false);
      setRoomPassword("");

      setShowCreateModal(false);

      toast.success(`Room #${newRoom.name} created`);
    } catch (err) {
      console.error(err);

      toast.error(err?.response?.data?.message || "Failed to create room");
    } finally {
      setCreating(false);
    }
  };

  return {
    rooms,
    setRooms,

    activeRoom,
    setActiveRoom,

    loadingRooms,
    roomsError,

    joinRoom,
    leaveRoom,

    showCreateModal,
    setShowCreateModal,

    newRoomName,
    setNewRoomName,

    newRoomDesc,
    setNewRoomDesc,

    isPrivate,
    setIsPrivate,

    roomPassword,
    setRoomPassword,

    creating,

    handleCreateRoom,
    typingUsers,
  };
};
