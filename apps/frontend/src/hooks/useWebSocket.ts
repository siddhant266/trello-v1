import { useEffect, useRef, useState } from "react";

export function useWebSocket(boardId: string | undefined) {
  const wsRef = useRef<WebSocket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!boardId) return;

    const myUsername = localStorage.getItem("username") ?? "anon";
    const ws = new WebSocket("ws://localhost:3002");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join", boardId, username: myUsername }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string);
        if (msg.type === "initial_state") {
          const list: string[] = Array.isArray(msg.users) ? msg.users : [];
          setOnlineUsers(
            Array.from(new Set(list.filter((u) => u && u !== myUsername)))
          );
        } else if (msg.type === "join") {
          const joinedUser = msg.userId as string;
          if (joinedUser && joinedUser !== myUsername) {
            setOnlineUsers((prev) => Array.from(new Set([...prev, joinedUser])));
          }
        } else if (msg.type === "leave") {
          const leftUser = msg.userId as string;
          setOnlineUsers((prev) => prev.filter((id) => id !== leftUser));
        }
      } catch (err) {
        console.error("Error handling WS message:", err);
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
      setOnlineUsers([]);
    };
  }, [boardId]);

  return { onlineUsers };
}
