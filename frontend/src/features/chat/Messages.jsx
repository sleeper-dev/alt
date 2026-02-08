import { useEffect, useRef, useState } from "react";
import { useSocket } from "../socket/SocketProvider.jsx";
import { api } from "../../shared/utils/axios.js";

export const Messages = ({ activeRoom }) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef();

  useEffect(() => {
    if (!activeRoom || !socket) return;

    const roomName = activeRoom.name;

    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/messages/${roomName}`);
        setMessages(data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };
    fetchMessages();

    const handleNewMessage = (msg) => {
      if (msg.roomName === roomName) setMessages((prev) => [...prev, msg]);
    };

    const handleSystemMessage = (msg) => {
      if (msg.roomName && msg.roomName !== roomName) return;

      setMessages((prev) => [
        ...prev,
        {
          _id: `sys-${Date.now()}`,
          content: msg.content,
          system: true,
          createdAt: msg.createdAt || new Date(),
        },
      ]);
    };

    const handleTypingStart = ({ userId, username }) => {
      setTypingUsers((prev) =>
        prev.find((u) => u.userId === userId)
          ? prev
          : [...prev, { userId, username }],
      );
    };

    const handleTypingStop = ({ userId }) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
    };

    socket.on("message:new", handleNewMessage);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);
    socket.on("system:message", handleSystemMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
      socket.off("system:message", handleSystemMessage);
    };
  }, [activeRoom, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!activeRoom)
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center font-mono">
        <div>
          <p className="mb-2 text-lg font-bold">Join a room</p>
          <p className="text-sm text-black/70">
            Select an existing room or create your own.
          </p>
        </div>
      </div>
    );

  return (
    <div className="flex-1 overflow-y-auto p-6 text-sm">
      <div className="space-y-4">
        {messages.map((msg) => {
          if (msg.system) {
            return (
              <div
                key={msg._id}
                className="text-center text-xs text-gray-500 italic"
              >
                {msg.content}
              </div>
            );
          }

          const isOwner =
            msg.sender?._id &&
            activeRoom?.ownerId &&
            msg.sender._id === activeRoom.ownerId;

          return (
            <div
              key={msg._id || msg.id}
              className={
                isOwner ? "border-l-4 border-yellow-400 bg-yellow-50 pl-3" : ""
              }
            >
              <span className="font-mono font-bold">
                [{new Date(msg.createdAt).toLocaleTimeString()}]
              </span>{" "}
              <span className="font-semibold">
                {isOwner && <span className="mr-1 text-yellow-500">👑</span>}
                {msg.sender.username}:
              </span>
              <p className="mt-1 ml-2">{msg.content}</p>
            </div>
          );
        })}
      </div>

      {typingUsers.length > 0 && (
        <div className="mt-4 font-mono text-xs text-black/60">
          {typingUsers.map((u) => u.username).join(", ")} typing...
        </div>
      )}

      <div ref={messagesEndRef}></div>
    </div>
  );
};
