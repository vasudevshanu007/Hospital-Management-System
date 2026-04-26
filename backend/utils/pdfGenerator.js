import PDFDocument from "pdfkit";

/**
 * Generate a prescription PDF and pipe it to the response.
 */
export const generatePrescriptionPDF = (res, prescription, patient, doctor) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=prescription-${prescription._id}.pdf`
  );

  doc.pipe(res);

  // ---- Header ----
  doc.fontSize(22).fillColor("#2b6cb0").text("HealthCare Hospital", { align: "center" });
  doc.fontSize(10).fillColor("#718096").text("Quality Care for Everyone", { align: "center" });
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#e2e8f0").stroke();
  doc.moveDown(0.5);

  // ---- Doctor / Patient Info ----
  doc.fontSize(12).fillColor("#2d3748");
  doc.text(`Doctor: Dr. ${doctor.firstName} ${doctor.lastName}`, { continued: true });
  doc.text(`   |   Department: ${doctor.doctorDepartment || "N/A"}`, { align: "right" });
  doc.text(`Patient: ${patient.firstName} ${patient.lastName}`, { continued: true });
  doc.text(`   |   Date: ${new Date(prescription.createdAt).toLocaleDateString()}`, { align: "right" });
  doc.moveDown(0.5);

  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#e2e8f0").stroke();
  doc.moveDown(0.5);

  // ---- Diagnosis ----
  if (prescription.diagnosis) {
    doc.fontSize(13).fillColor("#2b6cb0").text("Diagnosis");
    doc.fontSize(11).fillColor("#2d3748").text(prescription.diagnosis);
    doc.moveDown(0.5);
  }

  // ---- Medicines Table ----
  doc.fontSize(13).fillColor("#2b6cb0").text("Prescription");
  doc.moveDown(0.3);

  const tableTop = doc.y;
  const cols = { name: 50, dosage: 200, frequency: 290, duration: 390, instructions: 460 };

  // Table header
  doc.fontSize(10).fillColor("#ffffff");
  doc.rect(50, tableTop, 495, 20).fill("#2b6cb0");
  doc.text("Medicine", cols.name, tableTop + 5);
  doc.text("Dosage", cols.dosage, tableTop + 5);
  doc.text("Frequency", cols.frequency, tableTop + 5);
  doc.text("Duration", cols.duration, tableTop + 5);
  doc.text("Instructions", cols.instructions, tableTop + 5);

  let y = tableTop + 25;
  prescription.medicines.forEach((med, i) => {
    const bg = i % 2 === 0 ? "#f7fafc" : "#ffffff";
    doc.rect(50, y, 495, 20).fill(bg);
    doc.fontSize(9).fillColor("#2d3748");
    doc.text(med.name, cols.name, y + 5, { width: 145 });
    doc.text(med.dosage, cols.dosage, y + 5, { width: 85 });
    doc.text(med.frequency, cols.frequency, y + 5, { width: 95 });
    doc.text(med.duration, cols.duration, y + 5, { width: 65 });
    doc.text(med.instructions || "-", cols.instructions, y + 5, { width: 80 });
    y += 22;
  });

  doc.y = y + 10;
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#e2e8f0").stroke();
  doc.moveDown(0.5);

  // ---- Notes ----
  if (prescription.notes) {
    doc.fontSize(11).fillColor("#2b6cb0").text("Notes:");
    doc.fontSize(10).fillColor("#4a5568").text(prescription.notes);
    doc.moveDown(0.5);
  }

  // ---- Follow-up ----
  if (prescription.followUpDate) {
    doc.fontSize(11).fillColor("#2b6cb0").text("Follow-up Date:");
    doc.fontSize(10).fillColor("#4a5568").text(new Date(prescription.followUpDate).toLocaleDateString());
    doc.moveDown(0.5);
  }

  // ---- Doctor Signature ----
  doc.moveDown(2);
  doc.fontSize(11).fillColor("#2d3748").text(`Dr. ${doctor.firstName} ${doctor.lastName}`, { align: "right" });
  doc.fontSize(9).fillColor("#718096").text("Doctor's Signature", { align: "right" });

  doc.end();
};

/**
 * Generate an invoice PDF.
 */
export const generateInvoicePDF = (res, invoice, patient) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`
  );

  doc.pipe(res);

  // Header
  doc.fontSize(22).fillColor("#2b6cb0").text("HealthCare Hospital", { align: "center" });
  doc.fontSize(10).fillColor("#718096").text("Quality Care for Everyone", { align: "center" });
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#e2e8f0").stroke();
  doc.moveDown(0.5);

  doc.fontSize(18).fillColor("#2d3748").text("INVOICE", { align: "right" });
  doc.fontSize(11).fillColor("#718096")
    .text(`Invoice #: ${invoice.invoiceNumber}`, { align: "right" })
    .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, { align: "right" })
    .text(`Status: ${invoice.status}`, { align: "right" });

  doc.moveDown();
  doc.fontSize(12).fillColor("#2d3748")
    .text(`Patient: ${patient.firstName} ${patient.lastName}`)
    .text(`Email: ${patient.email}`)
    .text(`Phone: ${patient.phone}`);

  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#e2e8f0").stroke();
  doc.moveDown(0.5);

  // Services table
  const tTop = doc.y;
  doc.rect(50, tTop, 495, 20).fill("#2b6cb0");
  doc.fontSize(10).fillColor("#ffffff");
  doc.text("Service", 55, tTop + 5, { width: 250 });
  doc.text("Qty", 305, tTop + 5, { width: 60, align: "center" });
  doc.text("Unit Price", 365, tTop + 5, { width: 80, align: "right" });
  doc.text("Total", 445, tTop + 5, { width: 80, align: "right" });

  let y = tTop + 25;
  invoice.services.forEach((s, i) => {
    const bg = i % 2 === 0 ? "#f7fafc" : "#ffffff";
    doc.rect(50, y, 495, 20).fill(bg);
    doc.fontSize(9).fillColor("#2d3748");
    doc.text(s.description, 55, y + 5, { width: 245 });
    doc.text(s.quantity.toString(), 305, y + 5, { width: 60, align: "center" });
    doc.text(`₹${s.unitPrice}`, 365, y + 5, { width: 80, align: "right" });
    doc.text(`₹${s.total || s.quantity * s.unitPrice}`, 445, y + 5, { width: 80, align: "right" });
    y += 22;
  });

  doc.y = y + 10;

  // Totals
  const totalsX = 350;
  doc.fontSize(10).fillColor("#2d3748");
  doc.text(`Subtotal: ₹${invoice.subtotal || 0}`, totalsX, doc.y, { align: "right", width: 195 });
  doc.text(`Tax: ₹${invoice.tax || 0}`, totalsX, doc.y, { align: "right", width: 195 });
  doc.text(`Discount: ₹${invoice.discount || 0}`, totalsX, doc.y, { align: "right", width: 195 });
  doc.moveTo(350, doc.y).lineTo(545, doc.y).strokeColor("#2b6cb0").stroke();
  doc.fontSize(13).fillColor("#2b6cb0").text(`Total: ₹${invoice.totalAmount}`, totalsX, doc.y + 3, { align: "right", width: 195 });
  doc.fontSize(10).fillColor(invoice.status === "Paid" ? "#38a169" : "#e53e3e")
    .text(`Amount Paid: ₹${invoice.paidAmount || 0}`, totalsX, doc.y, { align: "right", width: 195 });

  doc.end();
};
