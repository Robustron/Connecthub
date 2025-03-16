const express = require("express");
const {
  sendMessage,
  getConversation,
  getConversations,
} = require("../controllers/chatController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/send", auth, sendMessage);
router.get("/conversation/:userId", auth, getConversation);
router.get("/conversations", auth, getConversations);

module.exports = router;
