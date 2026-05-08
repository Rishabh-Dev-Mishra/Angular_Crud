module.exports = (io) => {
  const onlineUsers = new Map();
  const isUserTyping = false;

  io.on("connection", (socket) => {
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
    });

    socket.on("user-online", (userId) => {
      onlineUsers.set(String(userId), socket.id);
      io.emit("users-online", Array.from(onlineUsers.keys()));
    });

    socket.on("sendMessage", (data) => {
      io.to(data.roomId).emit("receiveMessage", data);
      console.log("Sent Message");
    });

    socket.on("typing", (data) => {
      const receiverSocketId = onlineUsers.get(String(data.receiverId));

      if (receiverSocketId) {
        socket.to(receiverSocketId).emit("typing", "typing...");
      }
    });

    socket.on("stopTyping", (data) => {
      const receiverSocketId = onlineUsers.get(String(data.receiverId));

      if (receiverSocketId) {
        socket.to(receiverSocketId).emit("stopTyping", "stopped");
      }
    });

    socket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId == socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit("users-online", Array.from(onlineUsers.keys()));
      console.log("User disconnected", socket.id);
    });

    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
    });
  });
};
