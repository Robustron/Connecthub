const Notification = require("../models/Notification");

async function createNotification(
  recipientId,
  content,
  type,
  relatedId = null,
  onModel = null,
) {
  try {
    const notification = new Notification({
      recipient: recipientId,
      content,
      type,
      relatedId,
      onModel,
    });
    await notification.save();

    // Emit real-time notification using Socket.IO
    const io = require("../server").io;
    io.to(recipientId.toString()).emit("newNotification", notification);

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

module.exports = { createNotification };
