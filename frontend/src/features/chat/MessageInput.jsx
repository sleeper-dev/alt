import { useEffect, useRef, useState } from "react";
import { useSocket } from "../socket/SocketProvider.jsx";

export const MessageInput = ({ activeRoom }) => {
  const { socket } = useSocket();
  const [text, setText] = useState("");
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const handleTyping = () => {
    if (!socket || !activeRoom) return;

    if (!isTypingRef.current) {
      socket.emit("typing:start", { roomName: activeRoom.name });
      isTypingRef.current = true;
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", { roomName: activeRoom.name });
      isTypingRef.current = false;
    }, 1000);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!socket || !activeRoom || !text.trim()) return;

    socket.emit("message:send", {
      roomName: activeRoom.name,
      content: text,
    });

    if (isTypingRef.current) {
      socket.emit("typing:stop", { roomName: activeRoom.name });
      isTypingRef.current = false;
    }

    setText("");
    clearTimeout(typingTimeoutRef.current);
  };

  useEffect(() => {
    if (text) handleTyping();
  }, [text]);

  useEffect(() => {
    return () => {
      clearTimeout(typingTimeoutRef.current);
      if (isTypingRef.current && socket && activeRoom) {
        socket.emit("typing:stop", { roomName: activeRoom.name });
      }
    };
  }, [socket, activeRoom]);

  return (
    <form onSubmit={sendMessage} className="border-t-4 border-black/90 p-4">
      <div className="flex gap-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border-2 border-black/90 bg-transparent px-3 py-2 font-mono text-sm focus:outline-none"
        />
        <button
          type="submit"
          className="border-4 border-black/90 bg-[#6bf0ff] px-4 py-2 text-sm font-bold uppercase transition-transform hover:-translate-y-px"
        >
          Send
        </button>
      </div>
    </form>
  );
};
