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
      socket.emit("typing:start", {
        roomName: activeRoom.name,
      });

      isTypingRef.current = true;
    }

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", {
        roomName: activeRoom.name,
      });

      isTypingRef.current = false;
    }, 1200);
  };

  const handleChange = (e) => {
    setText(e.target.value);
    handleTyping();
  };

  const sendMessage = () => {
    if (!socket || !activeRoom) return;

    const content = text.replace(/\r\n/g, "\n");

    if (!content.trim()) return;

    if (content.startsWith("/")) {
      socket.emit("command:send", {
        command: content,
      });
    } else {
      socket.emit("message:send", {
        roomName: activeRoom.name,
        content,
      });
    }

    if (isTypingRef.current) {
      socket.emit("typing:stop", {
        roomName: activeRoom.name,
      });

      isTypingRef.current = false;
    }

    setText("");

    clearTimeout(typingTimeoutRef.current);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.shiftKey) {
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();

      sendMessage();
    }
  };

  useEffect(() => {
    return () => {
      clearTimeout(typingTimeoutRef.current);

      if (isTypingRef.current && socket && activeRoom) {
        socket.emit("typing:stop", {
          roomName: activeRoom.name,
        });
      }
    };
  }, [socket, activeRoom]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        sendMessage();
      }}
      className="border-t-4 border-black/90 p-4"
    >
      <div className="flex gap-3">
        <textarea
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows={1}
          className="flex-1 resize-none border-2 border-black/90 bg-transparent px-3 py-2 font-mono text-sm focus:outline-none"
        />

        <button
          type="submit"
          className="border-4 border-black/90 bg-[#6bf0ff] px-4 py-2 text-sm font-bold uppercase transition-transform hover:-translate-y-px"
        >
          Send
        </button>
      </div>

      {activeRoom.slowMode > 0 && (
        <div className="mt-2 font-mono text-[11px] text-black/50">
          Slow mode: {activeRoom.slowMode}s
        </div>
      )}
    </form>
  );
};
