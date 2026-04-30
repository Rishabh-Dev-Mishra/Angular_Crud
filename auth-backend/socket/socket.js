module.exports = (io) => {
  io.on("connection", (socket) => {
    // console.log("User connected", socket.id);
    socket.on("joinRoom", (roomId) => {
      // console.log("Joining room")
      socket.join(roomId);
      // console.log("Joined Room", roomId)
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
