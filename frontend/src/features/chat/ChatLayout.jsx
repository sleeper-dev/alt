import { ChatWindow } from "./ChatWindow.jsx";
import { Sidebar } from "./Sidebar.jsx";
import { Modal } from "../../shared/components/Modal.jsx";
import { useChat } from "./chat.context.jsx";
import { useState } from "react";

export const ChatLayout = () => {
  const chat = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f2efe6] p-2 sm:p-4 lg:p-6">
      <div className="mx-auto flex h-[calc(100vh-1rem)] max-h-[95vh] max-w-6xl overflow-hidden border-4 border-black/90 bg-[#fff9f1] sm:h-[calc(100vh-2rem)] lg:h-[calc(100vh-3rem)]">
        {/* MOBILE OVERLAY */}

        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          />
        )}

        {/* SIDEBAR */}

        <div
          className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#fff9f1] transition-transform duration-200 lg:static lg:z-auto lg:w-64 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } `}
        >
          <Sidebar
            rooms={chat.rooms}
            activeRoom={chat.activeRoom}
            loadingRooms={chat.loadingRooms}
            roomsError={chat.roomsError}
            joinRoom={chat.joinRoom}
            onShowCreate={() => chat.setShowCreateModal(true)}
            onCloseMobile={() => setSidebarOpen(false)}
          />
        </div>

        {/* CHAT */}

        <div className="min-w-0 flex-1">
          <ChatWindow
            activeRoom={chat.activeRoom}
            onOpenSidebar={() => setSidebarOpen(true)}
          />
        </div>
      </div>

      <Modal
        isOpen={chat.showCreateModal}
        onClose={() => chat.setShowCreateModal(false)}
        title="Create Room"
      >
        <form onSubmit={chat.handleCreateRoom} className="space-y-4">
          <input
            type="text"
            placeholder="Room name"
            value={chat.newRoomName}
            onChange={(e) => chat.setNewRoomName(e.target.value)}
            className="w-full border-2 border-black/90 px-3 py-2 font-mono text-sm focus:outline-none"
          />

          <input
            type="text"
            placeholder="Room topic (optional)"
            value={chat.newRoomTopic}
            onChange={(e) => chat.setNewRoomTopic(e.target.value)}
            className="w-full border-2 border-black/90 px-3 py-2 font-mono text-sm focus:outline-none"
          />

          <label className="flex items-center gap-2 font-mono text-sm">
            <input
              type="checkbox"
              checked={chat.isPrivate}
              onChange={(e) => chat.setIsPrivate(e.target.checked)}
            />
            Private room 🔒
          </label>

          {chat.isPrivate && (
            <input
              type="password"
              placeholder="Enter room password"
              value={chat.roomPassword}
              onChange={(e) => chat.setRoomPassword(e.target.value)}
              className="w-full border-2 border-black/90 px-3 py-2 font-mono text-sm focus:outline-none"
            />
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => chat.setShowCreateModal(false)}
              className="flex-1 border-2 border-black/90 bg-white px-3 py-2 text-sm font-bold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={chat.creating}
              className="flex-1 border-4 border-black/90 bg-[#6bf0ff] px-3 py-2 text-sm font-bold uppercase disabled:opacity-50"
            >
              {chat.creating ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
