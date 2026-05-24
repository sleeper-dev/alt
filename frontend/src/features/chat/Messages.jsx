import { useEffect, useRef, useState } from "react";
import { api } from "../../shared/utils/axios.js";
import { useSocket } from "../socket/SocketProvider.jsx";
import { useChat } from "./chat.context.jsx";
import {
  parseMentions,
  parseMessageContent,
} from "../../shared/utils/messages.js";
import { useAuth } from "../auth/auth.context.jsx";

export const Messages = ({ activeRoom }) => {
  const { socket } = useSocket();
  const { typingUsers } = useChat();
  const { user } = useAuth();

  const usersTyping = typingUsers?.[activeRoom?.name] || [];

  const [messages, setMessages] = useState([]);
  const [copiedBlock, setCopiedBlock] = useState(null);

  const messagesEndRef = useRef(null);
  const initialLoadRef = useRef(true);

  const copyCodeBlock = async (text, blockId) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopiedBlock(blockId);

      setTimeout(() => {
        setCopiedBlock(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  useEffect(() => {
    if (!activeRoom || !socket) return;

    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/messages/${activeRoom.name}`);

        setMessages(data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();

    const handleNewMessage = (msg) => {
      if (msg.roomName !== activeRoom.name) return;

      setMessages((prev) => [...prev, msg]);
    };

    const handleSystemMessage = (msg) => {
      if (msg.roomName && msg.roomName !== activeRoom.name) {
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          ...msg,
          _id: `sys-${Date.now()}`,
        },
      ]);
    };

    socket.on("message:new", handleNewMessage);
    socket.on("system:message", handleSystemMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("system:message", handleSystemMessage);
    };
  }, [activeRoom?.name, socket]);

  useEffect(() => {
    const container = messagesEndRef.current?.parentElement;

    if (!container) return;

    if (initialLoadRef.current) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "auto",
      });

      initialLoadRef.current = false;

      return;
    }

    const threshold = 120;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold;

    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    initialLoadRef.current = true;
  }, [activeRoom?.name]);

  if (!activeRoom) {
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
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 text-sm">
      <div className="space-y-4">
        {messages.map((msg) => {
          // SYSTEM MESSAGE
          if (msg.system) {
            return (
              <div
                key={msg._id}
                className={`text-center text-xs whitespace-pre-line italic ${
                  msg.action ? "font-semibold text-purple-500" : "text-gray-500"
                }`}
              >
                {msg.action ? "* " : ""}
                {msg.content}
              </div>
            );
          }

          const isOwner =
            msg.sender?._id &&
            activeRoom.ownerId &&
            msg.sender._id === activeRoom.ownerId;

          const isMentioningMe =
            user &&
            msg.sender?._id !== user._id &&
            msg.content
              ?.toLowerCase()
              .includes(`@${user.username.toLowerCase()}`);

          const parts = parseMessageContent(msg.content);

          return (
            <div
              key={msg._id || msg.id}
              className={`pl-3 ${
                isOwner ? "border-l-4 border-yellow-400 bg-yellow-50" : ""
              } ${
                isMentioningMe ? "border-l-4 border-cyan-400 bg-cyan-50" : ""
              } `}
            >
              <span className="font-mono font-bold">
                [{new Date(msg.createdAt).toLocaleTimeString()}]
              </span>{" "}
              <span className="font-semibold">
                {isOwner && <span className="mr-1 text-yellow-500">👑</span>}
                {msg.sender.username}:
              </span>
              <div className="mt-1 ml-2 space-y-2">
                {parts.map((part, index) => {
                  // NORMAL TEXT
                  if (part.type === "text") {
                    return (
                      <p
                        key={index}
                        className="wrap-break-word whitespace-pre-wrap"
                      >
                        {parseMentions(part.content).map(
                          (segment, segmentIndex) => {
                            if (segment.type === "mention") {
                              return (
                                <span
                                  key={segmentIndex}
                                  className="rounded bg-cyan-200 px-1 font-semibold text-cyan-900"
                                >
                                  {segment.content}
                                </span>
                              );
                            }

                            return (
                              <span key={segmentIndex}>{segment.content}</span>
                            );
                          },
                        )}
                      </p>
                    );
                  }

                  // CODE / ASCII BLOCK
                  if (part.type === "code") {
                    return (
                      <div
                        key={index}
                        className="overflow-hidden rounded-md border-2 border-black/80 bg-black"
                      >
                        <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                          <div className="font-mono text-[11px] text-green-400 uppercase">
                            {part.language || "text"}
                          </div>

                          <button
                            onClick={() =>
                              copyCodeBlock(part.content, `${msg._id}-${index}`)
                            }
                            className="cursor-pointer px-2 py-1 font-mono text-[10px] text-green-300 uppercase transition hover:bg-green-400/10"
                          >
                            {copiedBlock === `${msg._id}-${index}`
                              ? "[ Copied! ]"
                              : "[ Copy ]"}
                          </button>
                        </div>

                        <div className="overflow-x-auto">
                          <pre className="p-3 font-mono text-sm whitespace-pre text-green-300">
                            {part.content}
                          </pre>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          );
        })}
      </div>

      {usersTyping.length > 0 && (
        <div className="mt-4 font-mono text-xs text-black/60">
          {usersTyping.map((u) => u.username).join(", ")} typing...
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
