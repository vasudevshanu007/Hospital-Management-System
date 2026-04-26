import { Appointment }   from "../models/appointmentSchema.js";
import { User }          from "../models/userSchema.js";
import { MedicalRecord } from "../models/medicalRecordSchema.js";
import { Prescription }  from "../models/prescriptionSchema.js";
import { Invoice }       from "../models/invoiceSchema.js";
import { Inventory }     from "../models/inventorySchema.js";
import { LabReport }     from "../models/labReportSchema.js";
import { askGroq }       from "../utils/groq.js";

/* ─────────────────────────────────────────────────────────────
   HOSPITAL STATIC INFO  (injected into every prompt)
───────────────────────────────────────────────────────────── */
const HOSPITAL_INFO = `
Hospital Name : Vasudev Healthcare Medical Institute
Phone         : +91 82359 16360
Email         : vasudevshanu07@gmail.com
Location      : Ranchi, Deoghar
Working Hours : Mon 9AM–11PM | Tue 12PM–12AM | Wed 10AM–10PM |
                Thu 9AM–9PM  | Fri 3PM–9PM   | Sat 9AM–3PM
Services      : General Medicine, Cardiology, Neurology, Orthopaedics,
                Dermatology, Oncology, Paediatrics, Radiology, ENT, Physiotherapy
Book Online   : Available on our website
Payment       : Online via Razorpay | Cash at counter
`.trim();

/* ─────────────────────────────────────────────────────────────
   KEYWORD HELPERS
───────────────────────────────────────────────────────────── */
const has = (msg, ...words) => words.some(w => msg.includes(w));

/* ─────────────────────────────────────────────────────────────
   PATIENT / USER CHATBOT
───────────────────────────────────────────────────────────── */
export const userChatbot = async (req, res) => {
    try {
        const { message } = req.body;
        const userId      = req.user?._id;
        const msg         = message.toLowerCase();

        const ctx = {};

        /* ── Always: departments & doctor list ── */
        ctx.departments = await Appointment.distinct("department");

        ctx.doctors = await User.find({ role: "Doctor" })
            .select("firstName lastName doctorDepartment phone")
            .lean();

        /* ── Appointments ── */
        if (has(msg, "appointment", "booking", "schedule", "visit", "book")) {
            if (userId) {
                ctx.myAppointments = await Appointment.find({ patientId: userId })
                    .select("appointment_date department status hasVisited doctor")
                    .sort({ appointment_date: -1 })
                    .limit(10)
                    .lean();
            } else {
                ctx.appointmentNote = "Patient is not logged in — cannot fetch personal appointments.";
            }
        }

        /* ── Medical Records ── */
        if (has(msg, "record", "medical", "diagnosis", "diagnose", "health history", "condition", "report")) {
            if (userId) {
                ctx.myMedicalRecords = await MedicalRecord.find({ patientId: userId })
                    .select("title diagnosis recordType date vitals notes allergies")
                    .populate("doctorId", "firstName lastName doctorDepartment")
                    .sort({ date: -1 })
                    .limit(10)
                    .lean();
            }
        }

        /* ── Prescriptions ── */
        if (has(msg, "prescription", "medicine", "medication", "drug", "tablet", "dose", "dosage")) {
            if (userId) {
                ctx.myPrescriptions = await Prescription.find({ patientId: userId })
                    .select("medicines diagnosis notes followUpDate status")
                    .populate("doctorId", "firstName lastName doctorDepartment")
                    .sort({ createdAt: -1 })
                    .limit(10)
                    .lean();
            }
        }

        /* ── Bills / Invoices ── */
        if (has(msg, "bill", "invoice", "payment", "fee", "charge", "cost", "pay", "due", "amount")) {
            if (userId) {
                ctx.myBills = await Invoice.find({ patientId: userId })
                    .select("invoiceNumber totalAmount paidAmount status paymentMethod dueDate services")
                    .sort({ createdAt: -1 })
                    .limit(10)
                    .lean();
            }
        }

        /* ── Lab Reports ── */
        if (has(msg, "lab", "test", "blood", "sample", "result", "lab report")) {
            if (userId) {
                ctx.myLabReports = await LabReport.find({ patientId: userId })
                    .select("reportName reportType results notes status date")
                    .populate("doctorId", "firstName lastName")
                    .sort({ date: -1 })
                    .limit(10)
                    .lean();
            }
        }

        const prompt = `
You are a warm, knowledgeable AI assistant for Vasudev Healthcare Medical Institute.

=== HOSPITAL INFORMATION ===
${HOSPITAL_INFO}

=== PATIENT QUESTION ===
"${message}"

=== LIVE DATA FROM DATABASE ===
${JSON.stringify(ctx, null, 2)}

=== INSTRUCTIONS ===
1. Answer the patient's question directly and helpfully.
2. Use the live database data above to give specific, accurate answers.
3. If departments are asked → list them from ctx.departments.
4. If doctors are asked → list names and their departments from ctx.doctors.
5. If appointments are asked → summarise from ctx.myAppointments.
6. If prescriptions are asked → list medicines, dosage, frequency from ctx.myPrescriptions.
7. If bills are asked → show invoice numbers, amounts, status from ctx.myBills.
8. If lab reports are asked → show report name, status, results from ctx.myLabReports.
9. For general health questions → give brief, responsible general advice.
10. Keep response concise (under 6 sentences unless listing items).
11. Be friendly, empathetic, and professional.
12. Never make up data — only use what is provided above.
`;

        const reply = await askGroq(prompt);
        res.status(200).json({ success: true, reply });

    } catch (error) {
        console.error("User chatbot error:", error);
        res.status(500).json({ success: false, reply: "Unable to answer right now. Please try again." });
    }
};

/* ─────────────────────────────────────────────────────────────
   ADMIN CHATBOT
───────────────────────────────────────────────────────────── */
export const adminChatbot = async (req, res) => {
    try {
        const { message } = req.body;
        const msg         = message.toLowerCase();

        const ctx = {};

        /* ── Always: quick overview stats ── */
        const [totalDoctors, totalPatients, totalAppointments, pendingAppts,
               totalInvoices, lowStockItems] = await Promise.all([
            User.countDocuments({ role: "Doctor" }),
            User.countDocuments({ role: "Patient" }),
            Appointment.countDocuments(),
            Appointment.countDocuments({ status: "Pending" }),
            Invoice.countDocuments(),
            Inventory.countDocuments({ $expr: { $lte: ["$stockQuantity", "$minStockLevel"] } }),
        ]);

        ctx.quickStats = {
            totalDoctors,
            totalPatients,
            totalAppointments,
            pendingAppointments: pendingAppts,
            totalInvoices,
            lowStockItems,
        };

        /* ── Appointments ── */
        if (has(msg, "appointment", "schedule", "booking", "visit")) {
            ctx.appointments = await Appointment.find()
                .select("firstName lastName appointment_date department status hasVisited doctor")
                .sort({ appointment_date: -1 })
                .limit(30)
                .lean();

            ctx.appointmentStatusBreakdown = {
                accepted: await Appointment.countDocuments({ status: "Accepted" }),
                pending:  await Appointment.countDocuments({ status: "Pending" }),
                rejected: await Appointment.countDocuments({ status: "Rejected" }),
            };
        }

        /* ── Doctors ── */
        if (has(msg, "doctor", "specialist", "staff", "physician")) {
            ctx.doctors = await User.find({ role: "Doctor" })
                .select("firstName lastName email phone doctorDepartment")
                .lean();
        }

        /* ── Patients ── */
        if (has(msg, "patient", "user")) {
            ctx.patients = await User.find({ role: "Patient" })
                .select("firstName lastName email phone gender dob")
                .sort({ createdAt: -1 })
                .limit(30)
                .lean();
        }

        /* ── Inventory / Medicines / Stock ── */
        if (has(msg, "inventory", "medicine", "stock", "drug", "tablet", "capsule", "supply")) {
            ctx.inventory = await Inventory.find()
                .select("medicineName genericName category stockQuantity minStockLevel unitPrice expiryDate isActive")
                .lean();

            ctx.lowStockMedicines = ctx.inventory.filter(
                i => i.stockQuantity <= i.minStockLevel
            );
        }

        /* ── Billing / Revenue ── */
        if (has(msg, "bill", "invoice", "revenue", "payment", "income", "earning", "fee")) {
            ctx.recentInvoices = await Invoice.find()
                .select("invoiceNumber totalAmount paidAmount status paymentMethod createdAt")
                .populate("patientId", "firstName lastName")
                .sort({ createdAt: -1 })
                .limit(20)
                .lean();

            const revenueAgg = await Invoice.aggregate([
                { $match: { status: "Paid" } },
                { $group: { _id: null, totalRevenue: { $sum: "$paidAmount" } } }
            ]);
            ctx.totalRevenue = revenueAgg[0]?.totalRevenue ?? 0;

            const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            const monthAgg   = await Invoice.aggregate([
                { $match: { status: "Paid", paymentDate: { $gte: monthStart } } },
                { $group: { _id: null, monthRevenue: { $sum: "$paidAmount" } } }
            ]);
            ctx.thisMonthRevenue = monthAgg[0]?.monthRevenue ?? 0;
        }

        /* ── Lab Reports ── */
        if (has(msg, "lab", "test", "report", "blood", "sample", "result")) {
            ctx.labReports = await LabReport.find()
                .select("reportName reportType status date results")
                .populate("patientId", "firstName lastName")
                .populate("doctorId",  "firstName lastName")
                .sort({ date: -1 })
                .limit(20)
                .lean();
        }

        /* ── Prescriptions ── */
        if (has(msg, "prescription", "medicine", "medication", "drug")) {
            ctx.prescriptions = await Prescription.find()
                .select("medicines diagnosis status followUpDate createdAt")
                .populate("patientId", "firstName lastName")
                .populate("doctorId",  "firstName lastName")
                .sort({ createdAt: -1 })
                .limit(20)
                .lean();
        }

        /* ── Medical Records ── */
        if (has(msg, "medical record", "ehr", "health record", "diagnosis", "vitals")) {
            ctx.medicalRecords = await MedicalRecord.find()
                .select("title recordType diagnosis vitals date notes")
                .populate("patientId", "firstName lastName")
                .populate("doctorId",  "firstName lastName")
                .sort({ date: -1 })
                .limit(20)
                .lean();
        }

        /* ── Departments ── */
        if (has(msg, "department", "departments", "specialty", "specialties")) {
            ctx.departments = await Appointment.distinct("department");
        }

        const prompt = `
You are an intelligent admin AI for Vasudev Healthcare Medical Institute.

=== HOSPITAL INFORMATION ===
${HOSPITAL_INFO}

=== ADMIN QUESTION ===
"${message}"

=== LIVE DATABASE DATA ===
${JSON.stringify(ctx, null, 2)}

=== INSTRUCTIONS ===
1. Answer the admin's question accurately using the database data above.
2. For stats questions → use ctx.quickStats for totals.
3. For appointments → summarise with status breakdown from ctx.appointmentStatusBreakdown.
4. For doctors/patients → list names, email, department clearly.
5. For inventory → highlight low stock items prominently.
6. For billing → include total revenue, this month's revenue, and invoice status breakdown.
7. For lab reports / prescriptions / medical records → summarise key details.
8. Be concise and factual. Do NOT hallucinate data.
9. Format lists with bullet points when listing multiple items.
10. If data is empty for a query, say so honestly.
`;

        const reply = await askGroq(prompt);
        res.status(200).json({ success: true, reply });

    } catch (error) {
        console.error("Admin chatbot error:", error);
        res.status(500).json({ success: false, reply: "Unable to process admin query right now." });
    }
};
