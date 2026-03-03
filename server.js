const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

io.on("connection", (socket) => {

  socket.on("createRoom", (code) => {
    rooms[code] = [socket.id];
    socket.join(code);
  });

  socket.on("joinRoom", (code) => {
    if (rooms[code] && rooms[code].length === 1) {
      rooms[code].push(socket.id);
      socket.join(code);

      io.to(code).emit("startGame");
    }
  });

  socket.on("playerMove", ({ code, x, y }) => {
    socket.to(code).emit("opponentMove", { x, y });
  });

  socket.on("disconnect", () => {
    for (let code in rooms) {
      rooms[code] = rooms[code].filter(id => id !== socket.id);
      if (rooms[code].length === 0) {
        delete rooms[code];
      }
    }
  });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});