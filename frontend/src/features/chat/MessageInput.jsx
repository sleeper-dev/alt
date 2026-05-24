import { useEffect, useRef, useState } from "react";
import { useSocket } from "../socket/SocketProvider.jsx";
import { useAuth } from "../auth/auth.context.jsx";
import { api } from "../../shared/utils/axios.js";

export const MessageInput = ({ activeRoom }) => {
  const { socket } = useSocket();
  const { user } = useAuth();

  const [text, setText] = useState("");

  const [showMentions, setShowMentions] = useState(false);

  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentionUsers, setMentionUsers] = useState([]);

  const typingTimeoutRef = useRef(null);
  const mentionTimeoutRef = useRef(null);
  const abortRef = useRef(null);
  const isTypingRef = useRef(false);

  const filteredUsers = mentionUsers
    .filter((u) => u.username.toLowerCase() !== user.username.toLowerCase())
    .slice(0, 5);

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
    const value = e.target.value;

    setText(value);

    handleTyping();

    const match = value.match(/(?:^|\s)@([a-zA-Z0-9_]*)$/);

    // NO MENTION MATCH

    if (!match) {
      setShowMentions(false);

      setMentionUsers([]);

      abortRef.current?.abort();

      return;
    }

    const query = match[1];

    setShowMentions(true);

    setSelectedMentionIndex(0);

    if (!query.trim()) {
      setMentionUsers([]);

      return;
    }

    clearTimeout(mentionTimeoutRef.current);

    mentionTimeoutRef.current = setTimeout(async () => {
      try {
        abortRef.current?.abort();

        abortRef.current = new AbortController();

        const { data } = await api.get(`/users/search?q=${query}`, {
          signal: abortRef.current.signal,
        });

        setMentionUsers(data);
      } catch (err) {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
          return;
        }

        console.error(err);
      }
    }, 200);
  };

  const selectMention = (username) => {
    setText((prev) =>
      prev.replace(/(?:^|\s)@[a-zA-Z0-9_]*$/, ` @${username} `),
    );

    setShowMentions(false);

    setMentionUsers([]);

    setSelectedMentionIndex(0);
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

    abortRef.current?.abort();

    setText("");

    setShowMentions(false);
    setMentionUsers([]);
    setSelectedMentionIndex(0);

    clearTimeout(typingTimeoutRef.current);
  };

  const handleKeyDown = (e) => {
    if (showMentions && filteredUsers.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();

        setSelectedMentionIndex((prev) =>
          prev < filteredUsers.length - 1 ? prev + 1 : 0,
        );

        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();

        setSelectedMentionIndex((prev) =>
          prev > 0 ? prev - 1 : filteredUsers.length - 1,
        );

        return;
      }

      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();

        selectMention(filteredUsers[selectedMentionIndex].username);

        return;
      }

      if (e.key === "Escape") {
        setShowMentions(false);

        return;
      }
    }

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

      clearTimeout(mentionTimeoutRef.current);

      abortRef.current?.abort();

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
      <div className="relative flex gap-3">
        {/* MENTION POPUP */}

        {showMentions && filteredUsers.length > 0 && (
          <div className="absolute bottom-full left-0 z-50 mb-2 w-64 overflow-hidden border-2 border-black/90 bg-white shadow-lg">
            {filteredUsers.map((mentionUser, index) => (
              <button
                key={mentionUser.username}
                type="button"
                onClick={() => selectMention(mentionUser.username)}
                className={`block w-full px-3 py-2 text-left font-mono text-sm ${
                  index === selectedMentionIndex
                    ? "bg-cyan-200"
                    : "hover:bg-cyan-50"
                } `}
              >
                @{mentionUser.username}
              </button>
            ))}
          </div>
        )}

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
