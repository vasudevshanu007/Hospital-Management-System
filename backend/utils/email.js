import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send an email.
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 */
export const sendEmail = async (to, subject, html) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[Email skipped — SMTP not configured] To: ${to} | Subject: ${subject}`);
    return;
  }

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"HealthCare Hospital" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

/* ====================================
   EMAIL TEMPLATES
==================================== */

export const appointmentConfirmationEmail = (patientName, doctorName, date, department) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #2b6cb0;">Appointment Confirmed</h2>
    <p>Dear <strong>${patientName}</strong>,</p>
    <p>Your appointment has been confirmed. Here are your details:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Doctor</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">Dr. ${doctorName}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Department</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${department}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Date</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${date}</td></tr>
    </table>
    <p>Please arrive 15 minutes before your appointment time.</p>
    <p style="color: #718096; font-size: 12px;">HealthCare Hospital — Quality Care for Everyone</p>
  </div>
`;

export const prescriptionEmail = (patientName, doctorName, medicines) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #2b6cb0;">New Prescription</h2>
    <p>Dear <strong>${patientName}</strong>,</p>
    <p>Dr. <strong>${doctorName}</strong> has issued a prescription for you:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <thead>
        <tr style="background: #ebf8ff;">
          <th style="padding: 8px; border: 1px solid #bee3f8; text-align: left;">Medicine</th>
          <th style="padding: 8px; border: 1px solid #bee3f8;">Dosage</th>
          <th style="padding: 8px; border: 1px solid #bee3f8;">Frequency</th>
          <th style="padding: 8px; border: 1px solid #bee3f8;">Duration</th>
        </tr>
      </thead>
      <tbody>
        ${medicines.map(m => `
          <tr>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">${m.name}</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">${m.dosage}</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">${m.frequency}</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">${m.duration}</td>
          </tr>`).join("")}
      </tbody>
    </table>
    <p style="color: #718096; font-size: 12px;">HealthCare Hospital — Quality Care for Everyone</p>
  </div>
`;

export const invoiceEmail = (patientName, invoiceNumber, totalAmount, dueDate) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #2b6cb0;">Invoice Generated</h2>
    <p>Dear <strong>${patientName}</strong>,</p>
    <p>An invoice has been generated for your recent visit.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Invoice No.</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${invoiceNumber}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Total Amount</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">₹${totalAmount}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Due Date</strong></td><td style="padding: 8px; border: 1px solid #e2e8f0;">${dueDate || "Immediate"}</td></tr>
    </table>
    <p style="color: #718096; font-size: 12px;">HealthCare Hospital — Quality Care for Everyone</p>
  </div>
`;
