import { ChatWindow } from "./ChatWindow.jsx";
import { Sidebar } from "./Sidebar.jsx";
import { Modal } from "../../shared/components/Modal.jsx";
import { useChat } from "./chat.context.jsx";

export const ChatLayout = () => {
  const chat = useChat();

  return (
    <div className="min-h-screen bg-[#f2efe6] p-6">
      <div className="mx-auto flex h-[90vh] max-w-6xl border-4 border-black/90 bg-[#fff9f1]">
        <Sidebar
          rooms={chat.rooms}
          activeRoom={chat.activeRoom}
          setActiveRoom={chat.setActiveRoom}
          loadingRooms={chat.loadingRooms}
          roomsError={chat.roomsError}
          onShowCreate={() => chat.setShowCreateModal(true)}
        />

        <ChatWindow activeRoom={chat.activeRoom} />
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
            placeholder="Room description (optional)"
            value={chat.newRoomDesc}
            onChange={(e) => chat.setNewRoomDesc(e.target.value)}
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

          <div className="flex justify-between gap-3">
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
