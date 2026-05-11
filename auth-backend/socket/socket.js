module.exports = (io) => {
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
    });

    socket.on("userOnline", (userId) => {
      onlineUsers.set(String(userId), socket.id);
      io.emit("usersOnline", Array.from(onlineUsers.keys()));
    });


    socket.on("sendMessage", (data) => {
      io.to(data.roomId).emit("receiveMessage", data);
    });

    socket.on("typingMessage", (data) => {
      const receiverSocketId = onlineUsers.get(String(data.recieverId))
      

      if (receiverSocketId) {
        socket.to(receiverSocketId).emit("typing", {currentUserId: data.currentUserId});
      }
    });

    socket.on("stopTypingMessage", (data) => {
      const receiverSocketId = onlineUsers.get(String(data.recieverId))

      if (receiverSocketId) {
        socket.to(receiverSocketId).emit("stopTyping", {currentUserId: data.currentUserId});
      }
    });

    socket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId == socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit("usersOnline", Array.from(onlineUsers.keys()));
    });

    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
    });
  });
};
