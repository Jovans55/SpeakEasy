const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const corsOptions = {
  origin: "http://localhost:3000",
};

app.use(cors(corsOptions));

const server = http.createServer(app);

const io = new Server(server, {
  cors: corsOptions,
});

const roomUsers = {};

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", ({ room, username }) => {
    socket.join(room);
    console.log(`User with ID: ${socket.id} joined room: ${room}`);

    if (!roomUsers[room]) {
      roomUsers[room] = [];
    }
    roomUsers[room].push({ id: socket.id, username });

    io.to(room).emit("user_list", roomUsers[room]);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("leave_room", (room) => {
    if (roomUsers[room]) {
      roomUsers[room] = roomUsers[room].filter((user) => user.id !== socket.id);

      io.to(room).emit("user_list", roomUsers[room]);
    }
    socket.leave(room);
  });

  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);

    for (const room in roomUsers) {
      roomUsers[room] = roomUsers[room].filter((user) => user.id !== socket.id);
      io.to(room).emit("user_list", roomUsers[room]);
    }
  });
});

server.listen(3001, () => {
  console.log("🏃 RUNNING ON http://localhost:3001/ 🤑");
});
