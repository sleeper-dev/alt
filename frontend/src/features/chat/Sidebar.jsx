import { useEffect, useState } from "react";
import { useAuth } from "../auth/auth.context.jsx";
import { Modal } from "../../shared/components/Modal.jsx";
import { useSocket } from "../socket/SocketProvider.jsx";
import toast from "react-hot-toast";

export const Sidebar = ({
  rooms,
  activeRoom,
  setActiveRoom,
  loadingRooms,
  roomsError,
  onShowCreate,
}) => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const [passwordModal, setPasswordModal] = useState({
    isOpen: false,
    room: null,
  });
  const [password, setPassword] = useState("");

  const handleRoomClick = (room) => {
    const isOwner = room.ownerId === user._id;
    if (room.isPrivate && !isOwner) {
      setPasswordModal({ isOpen: true, room });
      return;
    }
    joinRoom(room.name);
  };

  const joinRoom = (roomName, password = "") => {
    if (!socket || activeRoom?.name === roomName) return;

    socket.emit("room:join", { roomName, password });

    socket.once("room:joined", () => {
      const joined = rooms.find((r) => r.name === roomName);
      if (joined) setActiveRoom(joined);

      setPasswordModal({ isOpen: false, room: null });
      setPassword("");
    });
  };

  useEffect(() => {
    if (!socket) return;

    const handleBanned = ({ roomName }) => {
      toast(`You were banned from #${roomName}`, {
        style: {
          background: "#fff9f1",
          color: "#000",
        },
        icon: "⚠️",
      });

      if (activeRoom?.name === roomName) {
        socket.emit("room:leave", { roomName });

        setActiveRoom(null);
      }
    };
    socket.on("room:banned", handleBanned);

    return () => {
      socket.off("room:banned", handleBanned);
    };
  }, [socket, activeRoom, setActiveRoom]);

  return (
    <aside className="flex w-64 flex-col border-r-4 border-black/90 p-4">
      <h1 className="mb-2 font-mono text-xl tracking-wider">{"// ROOMS //"}</h1>
      <div className="mb-4 flex items-center gap-3">
        <div className="inline-block h-4 w-12 bg-black" />
        <div className="h-4 flex-1 bg-linear-to-r from-[#ff6b6b] via-[#ffd166] to-[#6bf0ff] opacity-90" />
      </div>

      <div className="mb-4 border-2 border-black/90 bg-[#d0f5be] px-3 py-3">
        <p className="font-mono text-xs tracking-widest text-black/70 uppercase">
          Logged in as
        </p>
        <div className="mt-1 flex items-center justify-between">
          <p className="overflow-x-hidden font-mono text-lg font-bold">
            {user?.username}
          </p>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>
            <span className="font-mono text-xs font-semibold text-green-700">
              online
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onShowCreate}
        className="mb-4 w-full border-2 border-black/90 bg-white px-3 py-2 text-xs font-bold uppercase transition-transform hover:-translate-y-px"
      >
        + Create Room
      </button>

      <div className="flex-1 space-y-2 overflow-y-auto pr-1 text-sm">
        {loadingRooms && (
          <div className="font-mono text-xs">Loading rooms...</div>
        )}
        {roomsError && (
          <div className="font-mono text-xs text-red-600">{roomsError}</div>
        )}

        {!loadingRooms &&
          !roomsError &&
          rooms.map((room) => (
            <button
              key={room._id}
              onClick={() => handleRoomClick(room)}
              className={`flex w-full items-center justify-between border-2 border-black/90 px-3 py-2 text-left font-mono transition-colors ${activeRoom?._id === room._id ? "bg-[#d0f5be]" : "hover:bg-[#d0f5be"}`}
            >
              <span># {room.name}</span>
              {room.isPrivate && <span>🔒</span>}
            </button>
          ))}
      </div>

      <div className="mt-auto pt-4">
        <button
          onClick={logout}
          className="w-full border-2 border-black/90 bg-white px-3 py-2 text-xs font-bold uppercase transition-transform hover:-translate-y-px"
        >
          Logout
        </button>
      </div>

      {passwordModal.isOpen && passwordModal.room && (
        <Modal
          isOpen={passwordModal.isOpen}
          onClose={() => setPasswordModal({ isOpen: false, room: null })}
          title={`Join #${passwordModal.room.name}`}
        >
          <input
            type="password"
            placeholder="Enter room password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-black/90 px-3 py-2 font-mono text-sm focus:outline-none"
          />
          <button
            onClick={() => {
              joinRoom(passwordModal.room.name, password);
            }}
            className="mt-4 w-full border-4 border-black/90 bg-[#6bf0ff] px-4 py-2 text-sm font-bold uppercase transition-transform hover:-translate-y-px"
          >
            Join
          </button>
        </Modal>
      )}
    </aside>
  );
};
