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
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3 text-sm sm:p-6">
      <div className="w-full space-y-4">
        {messages.map((msg) => {
          // SYSTEM MESSAGE
          if (msg.system) {
            return (
              <div
                key={msg._id}
                className={`px-2 text-center text-xs whitespace-pre-line italic ${
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
            msg.mentions?.some((m) => m._id === user._id);

          const parts = parseMessageContent(msg.content);

          return (
            <div
              key={msg._id || msg.id}
              className={`min-w-0 overflow-hidden rounded-sm pl-2 sm:pl-3 ${
                isOwner ? "border-l-4 border-yellow-400 bg-yellow-50" : ""
              } ${
                isMentioningMe ? "border-l-4 border-cyan-400 bg-cyan-50" : ""
              }`}
            >
              {/* HEADER */}

              <div className="min-w-0 wrap-break-word">
                <span className="font-mono text-xs font-bold sm:text-sm">
                  [{new Date(msg.createdAt).toLocaleTimeString()}]
                </span>{" "}
                <span className="font-semibold break-all">
                  {isOwner && <span className="mr-1 text-yellow-500">👑</span>}
                  {msg.sender.username}:
                </span>
              </div>

              {/* CONTENT */}

              <div className="mt-1 ml-1 min-w-0 space-y-2 sm:ml-2">
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
                              const username = segment.content
                                .slice(1)
                                .toLowerCase();

                              const isValidMention = msg.mentions?.some(
                                (m) => m.username.toLowerCase() === username,
                              );

                              if (isValidMention) {
                                const isMe =
                                  username === user.username.toLowerCase();

                                return (
                                  <span
                                    key={segmentIndex}
                                    className={`rounded px-1 font-semibold break-all ${
                                      isMe
                                        ? "bg-cyan-300 text-cyan-950"
                                        : "bg-cyan-100 text-cyan-900"
                                    }`}
                                  >
                                    {segment.content}
                                  </span>
                                );
                              }
                            }

                            return (
                              <span key={segmentIndex}>{segment.content}</span>
                            );
                          },
                        )}
                      </p>
                    );
                  }

                  // CODE BLOCK

                  if (part.type === "code") {
                    return (
                      <div
                        key={index}
                        className="overflow-hidden rounded-md border-2 border-black/80 bg-black"
                      >
                        {/* HEADER */}

                        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-2 py-2 sm:px-3">
                          <div className="min-w-0 truncate font-mono text-[10px] text-green-400 uppercase sm:text-[11px]">
                            {part.language || "text"}
                          </div>

                          <button
                            onClick={() =>
                              copyCodeBlock(part.content, `${msg._id}-${index}`)
                            }
                            className="shrink-0 cursor-pointer px-2 py-1 font-mono text-[10px] text-green-300 uppercase transition hover:bg-green-400/10"
                          >
                            {copiedBlock === `${msg._id}-${index}`
                              ? "[ Copied! ]"
                              : "[ Copy ]"}
                          </button>
                        </div>

                        <div className="overflow-x-auto">
                          <pre className="p-3 font-mono text-xs whitespace-pre text-green-300 sm:text-sm">
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
        <div className="mt-4 font-mono text-xs wrap-break-word text-black/60">
          {usersTyping.map((u) => u.username).join(", ")} typing...
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
