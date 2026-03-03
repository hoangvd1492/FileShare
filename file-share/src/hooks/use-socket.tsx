import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { generateName, getBrowser, getOS } from "../helpers";

type User = {
  id?: string;
  name: string;
  browser: string;
  os: string;
};

type SocketContextType = {
  socket: Socket | null;
  user: User;
  peers: User[];
};

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<
  React.PropsWithChildren & { roomID?: string }
> = ({ children, roomID }) => {
  const socketRef = useRef<Socket | null>(null);

  const [user, setUser] = useState<User>({
    name: generateName(),
    browser: getBrowser(),
    os: getOS(),
  });

  const [peers, setPeers] = useState<User[]>([]);

  useEffect(() => {
    const socket = io("http://192.168.1.76:8080", {
      path: "/socket",
      transports: ["websocket"],
    });

    socketRef.current = socket;

    // ==========================
    // CONNECT
    // ==========================
    socket.on("connect", () => {
      console.log("Connected:", socket.id);

      const newUser: User = {
        ...user,
        id: socket.id,
      };

      setUser(newUser);

      socket.emit("room:join", newUser, roomID);
    });

    // ==========================
    // ROOM USERS
    // ==========================
    socket.on("room:users", (users: User[]) => {
      setPeers(users);
    });

    socket.on("peer:join", (peer: User) => {
      setPeers((prev) => {
        const exists = prev.find((p) => p.id === peer.id);
        if (exists) return prev;
        return [...prev, peer];
      });
    });

    socket.on("peer:leave", (peer: User) => {
      setPeers((prev) => prev.filter((p) => p.id !== peer.id));
    });

    // ==========================
    // ROOM FULL
    // ==========================
    socket.on("room:full", () => {
      alert("Phòng đã đủ 10 người!");
      socket.disconnect();
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [roomID]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        user,
        peers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used inside SocketProvider");
  }
  return context;
};
