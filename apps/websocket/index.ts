import { WebSocketServer } from "ws";

const server = new WebSocketServer({ port: 3002 });

// ROOMS: boardId -> array of { username, socket }
const ROOMS: Record<string, { username: string; socket: any }[]> = {};

server.on("connection", (socket) => {
  socket.on("message", (data) => {
    try {
      const parsedData = JSON.parse(data.toString());

      if (parsedData.type === "join") {
        const boardId: string = parsedData.boardId;
        const username: string = parsedData.username ?? "anon";

        if (!ROOMS[boardId]) {
          ROOMS[boardId] = [];
        }

        const wasAlreadyOnline = ROOMS[boardId].some((u) => u.username === username);

        // Add socket to room
        ROOMS[boardId].push({ username, socket });

        // If this user was not already in the room from another tab, notify others
        if (!wasAlreadyOnline) {
          for (const user of ROOMS[boardId]) {
            if (user.socket !== socket && user.username !== username) {
              user.socket.send(
                JSON.stringify({ type: "join", userId: username })
              );
            }
          }
        }

        // Send unique list of OTHER online users to the joining socket
        const otherUniqueUsers = Array.from(
          new Set(
            ROOMS[boardId]
              .filter((u) => u.username !== username)
              .map((u) => u.username)
          )
        );

        socket.send(
          JSON.stringify({
            type: "initial_state",
            users: otherUniqueUsers,
          })
        );
      }
    } catch (err) {
      console.error("WS message error:", err);
    }
  });

  socket.on("close", () => {
    Object.entries(ROOMS).forEach(([roomId, users]) => {
      const closingUser = users.find((u) => u.socket === socket);
      if (closingUser) {
        const closingUsername = closingUser.username;
        // Remove this socket
        ROOMS[roomId] = users.filter((u) => u.socket !== socket);

        // Check if user still has other tabs open in this room
        const stillInRoom = ROOMS[roomId].some(
          (u) => u.username === closingUsername
        );

        // Only send leave event if the user has no remaining open tabs
        if (!stillInRoom) {
          ROOMS[roomId].forEach(({ socket: s }) => {
            s.send(
              JSON.stringify({ type: "leave", userId: closingUsername })
            );
          });
        }
      }
    });
  });
});

console.log("WebSocket server running on ws://localhost:3002");
