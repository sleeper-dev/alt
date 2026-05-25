import { useSocket } from "../socket/SocketProvider.jsx";
import { MessageInput } from "./MessageInput.jsx";
import { Messages } from "./Messages.jsx";

export const ChatWindow = ({ activeRoom, onOpenSidebar }) => {
  const { roomUsers } = useSocket();

  const usersInRoom = roomUsers?.[activeRoom?.name] || [];

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      {/* HEADER */}

      <div className="border-b-4 border-black/90 p-3 sm:p-4">
        <div className="flex min-w-0 items-center gap-3">
          {/* MOBILE MENU */}

          <button
            onClick={onOpenSidebar}
            className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black/90 bg-white text-lg lg:hidden"
          >
            ☰
          </button>

          {/* LEFT */}

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
              <h2 className="truncate font-mono text-sm tracking-wide sm:text-lg">
                {activeRoom
                  ? `// #${activeRoom.name.toUpperCase()} //`
                  : "// NO ROOM SELECTED //"}
              </h2>

              {activeRoom?.topic && (
                <span
                  title={activeRoom.topic}
                  className="truncate font-mono text-xs text-black/70 sm:text-sm"
                >
                  {activeRoom.topic}
                </span>
              )}
            </div>
          </div>

          {/* RIGHT */}

          {activeRoom && (
            <div className="group relative hidden shrink-0 items-center gap-2 font-mono text-xs whitespace-nowrap sm:flex">
              <span className="h-2 w-2 rounded-full bg-green-500" />

              <span>{usersInRoom.length} online</span>

              {/* USER LIST */}

              <div className="absolute top-full right-0 z-50 mt-2 hidden min-w-52 rounded-md border-2 border-black/90 bg-white p-3 shadow-lg group-hover:block">
                <div className="mb-2 text-[10px] font-bold text-black/60 uppercase">
                  Active Users
                </div>

                {usersInRoom.length === 0 ? (
                  <div className="text-xs text-black/50 italic">
                    No one here yet
                  </div>
                ) : (
                  <ul className="space-y-1 text-xs">
                    {usersInRoom.map((roomUser) => {
                      const isOwner =
                        activeRoom?.ownerId &&
                        roomUser.userId === activeRoom.ownerId;

                      return (
                        <li
                          key={roomUser.userId}
                          className="flex items-center gap-2"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                          {isOwner && (
                            <span className="text-yellow-500">👑</span>
                          )}

                          <span className="truncate">{roomUser.username}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {!activeRoom ? (
        <div className="flex flex-1 items-center justify-center p-6 text-center font-mono">
          <div>
            <p className="mb-2 text-lg font-bold">Join a room</p>
            <p className="text-sm text-black/70">
              Select an existing room or create your own.
            </p>
          </div>
        </div>
      ) : (
        <>
          <Messages activeRoom={activeRoom} />
          <MessageInput activeRoom={activeRoom} />
        </>
      )}
    </div>
  );
};
