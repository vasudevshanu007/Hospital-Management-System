import express from "express";
import { adminChatbot } from "../controller/chatbotController.js";
import { isAdminAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/admin", isAdminAuthenticated, adminChatbot);

export default router;
