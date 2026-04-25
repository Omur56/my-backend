import { Server } from "socket.io";

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Admin connected");

  socket.on("disconnect", () => {
    console.log("Admin disconnected");
  });
});

export { io };