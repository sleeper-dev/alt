import { Room } from "../rooms/room.model.js";
import { Message } from "./messages.model.js";

export const getMessages = async (req, res) => {
  const roomName = req.params.roomName.toLowerCase().trim();

  const room = await Room.findOne({ name: roomName });
  if (!room) {
    return res.status(404).json({ message: "Room not found" });
  }

  const messages = await Message.find({ room: room._id })
    .sort({
      createdAt: 1,
    })
    .populate("sender", "username");

  res.json(messages);
};
