const { Server } = require("socket.io");

const MAX_USERS_PER_ROOM = 10;

const setupSocket = (server) => {
  const io = new Server(server, {
    path: "/socket",
    cors: {
      origin: process.env.FRONTEND_URL || true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // ==========================
    // JOIN ROOM
    // ==========================
    socket.on("room:join", async (user, roomID) => {
      try {
        const xff = socket.handshake.headers["x-forwarded-for"];
        const ip =
          typeof xff === "string"
            ? xff.split(",")[0].trim()
            : socket.handshake.address;

        const room = roomID || ip;

        // Lấy toàn bộ socket trong room
        const socketsInRoom = await io.in(room).fetchSockets();

        // 🚀 Giới hạn 10 người
        if (socketsInRoom.length >= MAX_USERS_PER_ROOM) {
          socket.emit("room:full");
          return;
        }

        const usersInRoom = socketsInRoom
          .map((s) => s.data.user)
          .filter(Boolean);

        // Lưu data vào socket
        socket.data.room = room;
        socket.data.user = user;

        socket.join(room);

        console.log(
          `User ${user?.id} joined room: ${room} (${socketsInRoom.length + 1}/${MAX_USERS_PER_ROOM})`,
        );

        // Thông báo cho người khác
        socket.to(room).emit("peer:join", user);

        // Trả danh sách user hiện tại cho người vừa join
        socket.emit("room:users", usersInRoom);
      } catch (err) {
        console.error("Join room error:", err);
        socket.emit("room:error", "Cannot join room");
      }
    });

    // ==========================
    // WEBRTC SIGNALING
    // ==========================
    socket.on("peer:offer", ({ to, offer, meta }) => {
      socket.to(to).emit("peer:offer", {
        from: socket.id,
        offer,
        meta,
      });
    });

    socket.on("peer:answer", ({ to, answer }) => {
      socket.to(to).emit("peer:answer", {
        from: socket.id,
        answer,
      });
    });

    socket.on("peer:ice", ({ to, candidate }) => {
      socket.to(to).emit("peer:ice", {
        from: socket.id,
        candidate,
      });
    });

    // ==========================
    // DISCONNECT
    // ==========================
    socket.on("disconnect", () => {
      const room = socket.data?.room;
      const user = socket.data?.user;

      if (room && user) {
        console.log(`User ${user?.id} disconnected & left room: ${room}`);

        socket.to(room).emit("peer:leave", user);
      }
    });
  });
};

module.exports = { setupSocket };
