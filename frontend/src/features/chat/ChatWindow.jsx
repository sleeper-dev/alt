import { useSocket } from "../socket/SocketProvider.jsx";
import { MessageInput } from "./MessageInput.jsx";
import { Messages } from "./Messages.jsx";

export const ChatWindow = ({ activeRoom }) => {
  const { roomUsers } = useSocket();

  const usersInRoom = roomUsers?.[activeRoom?.name] || [];

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {/* Header */}
      <div className="flex min-w-0 items-center border-b-4 border-black/90 p-4">
        {/* LEFT */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <h2 className="shrink-0 font-mono text-lg tracking-wide whitespace-nowrap">
            {activeRoom
              ? `// #${activeRoom.name.toUpperCase()} //`
              : "// NO ROOM SELECTED //"}
          </h2>

          {activeRoom && (
            <span
              title={activeRoom.description}
              className="min-w-0 flex-1 overflow-hidden font-mono text-sm whitespace-nowrap"
            >
              {activeRoom.description}
            </span>
          )}
        </div>

        {/* RIGHT */}
        <div className="group relative ml-4 flex shrink-0 items-center gap-2 font-mono text-xs whitespace-nowrap">
          {activeRoom && (
            <>
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              {usersInRoom.length} online
              <div className="absolute top-full right-0 z-50 mt-2 hidden min-w-45 rounded-md border-2 border-black/90 bg-white p-3 shadow-lg group-hover:block">
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
                          className="flex items-center gap-1"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>

                          {isOwner && (
                            <span className="text-yellow-500">👑</span>
                          )}

                          {roomUser.username}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </>
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
