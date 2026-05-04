module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
    });

    socket.on("sendMessage", (data) => {
      io.to(data.roomId).emit("receiveMessage", data);
      console.log("Sent Message");

    });

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
    });


    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
    });
  });
};
