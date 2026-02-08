import { useEffect, useState } from "react";
import { createRoom, getRooms } from "../rooms/rooms.api.js";
import toast from "react-hot-toast";

export const useChat = () => {
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
      console.log(newRoom);
      setRooms((prev) => [...prev, newRoom]);
      setActiveRoom(newRoom);
      setNewRoomName("");
      setNewRoomDesc("");
      setIsPrivate(false);
      setRoomPassword("");
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to create room");
    } finally {
      setCreating(false);
    }
  };

  return {
    rooms,
    activeRoom,
    setActiveRoom,
    loadingRooms,
    roomsError,
    showCreateModal,
    setShowCreateModal,
    newRoomName,
    setNewRoomName,
    newRoomDesc,
    setNewRoomDesc,
    isPrivate,
    setIsPrivate,
    creating,
    handleCreateRoom,
    setRoomPassword,
  };
};
