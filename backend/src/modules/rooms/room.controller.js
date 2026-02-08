import { Room } from "./room.model.js";
import bcrypt from "bcrypt";

const ROOM_NAME_REGEX = /^[a-z0-9-_]+$/;

export const getRooms = async (req, res) => {
  const rooms = await Room.find({ isActive: true })
    .select("-password")
    .sort({ name: 1 });

  res.json(rooms);
};

export const createRoom = async (req, res) => {
  let { name, description, isPrivate, password } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Room name is required" });
  }

  name = name.trim().toLowerCase();

  if (!ROOM_NAME_REGEX.test(name)) {
    return res.status(400).json({
      message: "Room name can contain only lowercase letters, numbers, - and _",
    });
  }

  const existingRoom = await Room.findOne({ name });
  if (existingRoom) {
    return res.status(409).json({ message: "Room already exist" });
  }

  let hashedPassword = null;
  if (isPrivate) {
    if (!password) {
      return res
        .status(400)
        .json({ message: "Password required for private room" });
    }
    hashedPassword = await bcrypt.hash(password, 10);
  }

  const room = await Room.create({
    name,
    description,
    isPrivate,
    password: hashedPassword,
    ownerId: req.user.id,
  });
  res.status(201).json(room);
};

export const deleteRoom = async (req, res) => {
  const roomName = req.params.roomName.toLowerCase().trim();

  const room = await Room.findOne({ name: roomName });
  if (!room) {
    return res.status(404).json({ message: "Room not found" });
  }

  if (room.ownerId.toString() !== req.user.id) {
    return res
      .status(403)
      .json({ message: "Only room owner can delete the room" });
  }

  room.isActive = false;
  await room.save();

  res.json({ message: "Room deleted successfully" });
};
