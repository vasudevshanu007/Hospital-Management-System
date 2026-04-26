import express from "express";
import { dbConnection } from "./database/dbConnection.js";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import { errorMiddleware } from "./middlewares/error.js";
import { generalLimiter, authLimiter } from "./middlewares/rateLimiter.js";

// Routers
import messageRouter from "./router/messageRouter.js";
import userRouter from "./router/userRouter.js";
import appointmentRouter from "./router/appointmentRouter.js";
import chatbotRoutes from "./router/chatbot.js";
import adminChatbotRoutes from "./router/adminchatbot.js";
import medicalRecordRouter from "./router/medicalRecordRouter.js";
import prescriptionRouter from "./router/prescriptionRouter.js";
import labReportRouter from "./router/labReportRouter.js";
import invoiceRouter from "./router/invoiceRouter.js";
import inventoryRouter from "./router/inventoryRouter.js";
import analyticsRouter from "./router/analyticsRouter.js";

const app = express();

// ✅ Load environment variables
config();

// ✅ Security headers (helmet)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// ✅ CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.DASHBOARD_URL,
  "http://localhost:5173",
  "http://localhost:5174",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// ✅ Body parsers & cookies
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ Prevent NoSQL injection attacks
app.use(mongoSanitize());

// ✅ File upload
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// ✅ General rate limiter on all API routes
app.use("/api", generalLimiter);

// ✅ Routes — Auth (stricter rate limit)
app.use("/api/v1/user", authLimiter, userRouter);

// ✅ Routes — Core
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/appointment", appointmentRouter);

// ✅ Routes — EHR & Clinical
app.use("/api/v1/medical-records", medicalRecordRouter);
app.use("/api/v1/prescriptions", prescriptionRouter);
app.use("/api/v1/lab-reports", labReportRouter);

// ✅ Routes — Billing & Pharmacy
app.use("/api/v1/invoices", invoiceRouter);
app.use("/api/v1/inventory", inventoryRouter);

// ✅ Routes — Analytics
app.use("/api/v1/analytics", analyticsRouter);

// ✅ Routes — AI Chatbot
app.use("/api/v1/chatbot", chatbotRoutes);
app.use("/api/v1/chatbot", adminChatbotRoutes);

// ✅ Database connection
dbConnection();

// ✅ Error middleware (ALWAYS LAST)
app.use(errorMiddleware);

export default app;
