import { useState } from "react";
import { Modal } from "../../shared/components/Modal.jsx";
import { useAuth } from "../auth/auth.context.jsx";

export const Sidebar = ({
  rooms,
  activeRoom,
  loadingRooms,
  roomsError,
  joinRoom,
  onShowCreate,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();

  const [passwordModal, setPasswordModal] = useState({
    isOpen: false,
    room: null,
  });

  const [password, setPassword] = useState("");

  const handleRoomClick = (room) => {
    const isOwner = room.ownerId === user._id;

    if (room.isPrivate && !isOwner) {
      setPasswordModal({
        isOpen: true,
        room,
      });

      return;
    }

    joinRoom(room.name);

    onCloseMobile?.();
  };

  const handlePrivateJoin = () => {
    if (!passwordModal.room) return;

    joinRoom(passwordModal.room.name, password);

    setPasswordModal({
      isOpen: false,
      room: null,
    });

    setPassword("");

    onCloseMobile?.();
  };

  const closePasswordModal = () => {
    setPasswordModal({
      isOpen: false,
      room: null,
    });

    setPassword("");
  };

  return (
    <aside className="flex h-full flex-col border-r-4 border-black/90 bg-[#fff9f1] p-4">
      {/* HEADER */}

      <div className="flex items-center justify-between gap-3">
        <h1 className="font-mono text-lg tracking-wider sm:text-xl">
          {"// ROOMS //"}
        </h1>

        {/* MOBILE CLOSE */}

        <button
          onClick={onCloseMobile}
          className="flex h-9 w-9 items-center justify-center border-2 border-black/90 bg-white text-lg lg:hidden"
        >
          ✕
        </button>
      </div>

      <div className="mt-2 mb-4 flex items-center gap-3">
        <div className="inline-block h-4 w-12 shrink-0 bg-black" />

        <div className="h-4 flex-1 bg-linear-to-r from-[#ff6b6b] via-[#ffd166] to-[#6bf0ff] opacity-90" />
      </div>

      {/* USER */}

      <div className="mb-4 border-2 border-black/90 bg-[#d0f5be] px-3 py-3">
        <p className="font-mono text-xs tracking-widest text-black/70 uppercase">
          Logged in as
        </p>

        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="truncate font-mono text-base font-bold sm:text-lg">
            {user?.username}
          </p>

          <div className="flex shrink-0 items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

            <span className="font-mono text-xs font-semibold text-green-700">
              online
            </span>
          </div>
        </div>
      </div>

      {/* CREATE ROOM */}

      <button
        onClick={onShowCreate}
        className="mb-4 w-full border-2 border-black/90 bg-white px-3 py-2 text-xs font-bold uppercase transition-transform hover:-translate-y-px"
      >
        + Create Room
      </button>

      {/* ROOM LIST */}

      <div className="flex-1 space-y-2 overflow-y-auto pr-1 text-sm">
        {loadingRooms && (
          <div className="font-mono text-xs">Loading rooms...</div>
        )}

        {roomsError && (
          <div className="font-mono text-xs text-red-600">{roomsError}</div>
        )}

        {!loadingRooms &&
          !roomsError &&
          rooms.map((room) => {
            const isActive = activeRoom?._id === room._id;

            return (
              <button
                key={room._id}
                onClick={() => handleRoomClick(room)}
                className={`flex w-full items-center justify-between gap-2 border-2 border-black/90 px-3 py-2 text-left font-mono transition-colors ${
                  isActive
                    ? "bg-[#d0f5be]"
                    : "cursor-pointer hover:bg-[#c7f9cc]"
                }`}
              >
                <span className="truncate"># {room.name}</span>

                {room.isPrivate && <span className="shrink-0">🔒</span>}
              </button>
            );
          })}
      </div>

      {/* LOGOUT */}

      <div className="mt-auto pt-4">
        <button
          onClick={logout}
          className="w-full border-2 border-black/90 bg-white px-3 py-2 text-xs font-bold uppercase transition-transform hover:-translate-y-px"
        >
          Logout
        </button>
      </div>

      {/* PASSWORD MODAL */}

      {passwordModal.isOpen && passwordModal.room && (
        <Modal
          isOpen={passwordModal.isOpen}
          onClose={closePasswordModal}
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
            onClick={handlePrivateJoin}
            className="mt-4 w-full border-4 border-black/90 bg-[#6bf0ff] px-4 py-2 text-sm font-bold uppercase transition-transform hover:-translate-y-px"
          >
            Join
          </button>
        </Modal>
      )}
    </aside>
  );
};
