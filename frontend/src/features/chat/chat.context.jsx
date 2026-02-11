import { createContext, useContext } from "react";
import { useChatState } from "./useChatState.js";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const chat = useChatState();

  return <ChatContext.Provider value={chat}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  return useContext(ChatContext);
};
