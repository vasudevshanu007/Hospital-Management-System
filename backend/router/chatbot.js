import express from "express";
import { userChatbot } from "../controller/chatbotController.js";

const router = express.Router();

// No auth required — chatbot works for all visitors.
// Controller safely handles the case where req.user is undefined.
router.post("/user", userChatbot);

export default router;
