import { AuditLog } from "../models/auditLogSchema.js";

/**
 * Creates an audit log entry.
 * Usage: await createAuditLog(req, "CREATE", "Appointment", appointmentId, "Booked appointment");
 */
export const createAuditLog = async (req, action, resource, resourceId = null, details = null, status = "Success") => {
  try {
    await AuditLog.create({
      userId: req.user?._id || null,
      userEmail: req.user?.email || "anonymous",
      userRole: req.user?.role || "unknown",
      action,
      resource,
      resourceId: resourceId?.toString() || null,
      details,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers["user-agent"],
      status,
    });
  } catch (err) {
    // Never block request flow due to audit log failure
    console.error("Audit log error:", err.message);
  }
};
