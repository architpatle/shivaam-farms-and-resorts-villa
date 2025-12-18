import React from "react";
import jsPDF from "jspdf";
import "./Invoice.css";

const Invoice = ({ booking, onClose }) => {
  if (!booking) return null;

  const company = {
    name: "SHIVAAM FARMS & RESORTS",
    address: "01, AB, Green Planet , Omkar Nagar",
    phone: "+91 7387750307",
    email: "shivaamfarmsandresorts@gmail.com",
  };

  // ------------------------- GST TABLE BUILDER -------------------------
  const getGSTRows = () => {
    const rows = [];

    if (booking.gst_type === "CGST + SGST (9% + 9%)") {
      rows.push({ label: "CGST (9%)", value: booking.cgst_amount });
      rows.push({ label: "SGST (9%)", value: booking.sgst_amount });
    }

    if (booking.gst_type === "IGST (18%)") {
      rows.push({ label: "IGST (18%)", value: booking.igst_amount });
    }

    rows.push({ label: "Total GST", value: booking.gst_amount });

    return rows;
  };

  const gstRows = getGSTRows();

  // ------------------------- PDF DOWNLOAD -------------------------
  const handleDownload = (doc = null, silent = false) => {
    if (!doc) doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    /* ---------------- WATERMARK ---------------- */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(34);
    doc.setTextColor(220, 220, 220);
    doc.text("SHIVAAM FARMS & RESORTS", pageWidth / 2, 160, {
      align: "center",
      angle: 42,
    });

    /* ---------------- HEADER ---------------- */
    doc.setTextColor(0, 100, 0); // Green color for company name
    doc.setFontSize(18);
    doc.text("SHIVAAM FARMS & RESORTS", 15, 20);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("01, AB, Green Planet, Omkar Nagar", 15, 26);
    doc.text("+91 7387750307 | shivaamfarmsandresorts@gmail.com", 15, 31);

    // Using `new Date().toLocaleString()` for current date/time on the right
    doc.text(`Date: ${new Date().toLocaleString()}`, pageWidth - 80, 20);
    doc.text(
      `Check-in: ${new Date(booking.checkIn).toLocaleDateString()}`,
      pageWidth - 80,
      26
    );
    doc.text(
      `Check-out: ${new Date(booking.checkOut).toLocaleDateString()}`,
      pageWidth - 80,
      32
    );
    doc.text(`Guests: ${booking.guests}`, pageWidth - 80, 38);

    /* ---------------- GUEST DETAILS ---------------- */
    let y = 48;

    doc.setFont("helvetica", "bold");
    // doc.text("Guest Details", 15, y); // Removed this line as it's not in the image but leaving the Y positioning

    doc.setFont("helvetica", "normal");
    y += 7;
    doc.text(`Guest: ${booking.guest}`, 15, y);
    // y += 6;
    // doc.text(`Email: ${booking.email}`, 15, y);
    y += 6;
    doc.text(`Phone: ${booking.phone || "-"}`, 15, y);
    y += 6;
    doc.text(`Villa: ${booking.villa}`, 15, y);

    /* ---------------- ITEM TABLE ---------------- */
    y += 12;

    doc.setFont("helvetica", "bold");
    doc.setFillColor(212, 237, 218); // table-success color
    doc.rect(15, y, pageWidth - 30, 8, "F");
    doc.text("Description", 20, y + 6);
    doc.text("Rate (Rs.)", 100, y + 6);
    doc.text("Qty", 140, y + 6);
    doc.text("Subtotal (Rs.)", 165, y + 6);

    /* item row */
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.text(booking.villa, 20, y);
    doc.text(`Rs. ${booking.base_amount}`, 105, y);
    doc.text("1", 142, y);
    doc.text(`Rs. ${booking.base_amount}`, 170, y);

    /* ---------------- GST TABLE ---------------- */
    y += 15;

    // GST Details Header/Title
    doc.setFontSize(12);
    doc.text("GST Details", 15, y);
    y += 5; // move down after the title

    // Tax Header Row
    doc.setFont("helvetica", "bold");
    doc.setFillColor(255, 245, 204); // table-warning color
    doc.rect(15, y, pageWidth - 30, 8, "F");
    doc.text("Tax Type", 20, y + 6);
    doc.text("Amount (Rs.)", 165, y + 6);

    y += 14;
    doc.setFont("helvetica", "normal");

    // Auto GST rows (IGST/CGST+SGST, and Total GST)
    const rows = getGSTRows();
    rows.forEach((r) => {
      doc.text(r.label, 20, y);
      doc.text(`Rs. ${Number(r.value).toFixed(2)}`, 170, y); // Added '₹' and toFixed(2)
      y += 8;
    });

    // FIX: Grand Total Row - This was the row missing from the image replication
    doc.setFont("helvetica", "bold");
    doc.setFillColor(220, 237, 247); // A light blue color for Grand Total row
    doc.rect(15, y, pageWidth - 30, 8, "F");
    doc.text("Grand Total", 20, y + 6);
    doc.text(`Rs. ${Number(booking.total_amount).toFixed(2)}`, 170, y + 6); // Use toFixed(2) for consistency

    /* ---------------- PAYMENT DETAILS ---------------- */
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.text(`Payment Mode: ${booking.payment_mode}`, 15, y);
    y += 6;
    doc.text(`Received By: ${booking.received_by}`, 15, y);
    // Removed Remaining amount line as it is not in the image.
    // y += 6;
    // doc.text(`Remaining: Rs. ${booking.remaining_amount}`, 15, y);

    /* ---------------- TERMS ---------------- */
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.text("Terms and Conditions:", 15, y);

    doc.setFont("helvetica", "normal");
    y += 6;
    const terms = [
      // "For security, 5 member Aadhar cards are required during check-in. They will be returned during check-out.",
      "1. Check-in time is 1:00 PM and check-out time is 11:00 AM. Early check-in or late check-out is subject to availability and may incur additional charges.",
      "2. Guests are responsible for any damage caused to villa property, furniture, fixtures, or electrical appliances during their stay.",
      "3. Outside food delivery is strictly prohibited unless written permission is granted by management.",
      "4. Loud music is not allowed after 10:00 PM as per local regulations. Guests must maintain decorum and avoid disturbing other residents.",
      "5. Pool usage is at the guest’s own risk. Children must be accompanied by adults at all times.",
      "6. Management is not responsible for loss of personal belongings, valuables, or unattended items.",
    ];

    doc.text(terms, 15, y, { maxWidth: 180 });

    /* ---------------- FOOTER ---------------- */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Thank you for visiting!", pageWidth / 2, 290, {
      align: "center",
    });

    /* SAVE */
    if (!silent) {
      doc.save(`Invoice_${booking.guest}_${booking.villa}.pdf`);
    }
    return doc;
  };

  // ------------------------- SHARE VIA WHATSAPP -------------------------
  const handleShareWhatsApp = async () => {
    try {
      if (!booking.phone) {
        alert("No phone number found for this booking");
        return;
      }

      const phone = booking.phone.replace(/\D/g, "");

      if (phone.length < 10) {
        alert("Invalid phone number");
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      const res = await fetch(
        `${API_BASE_URL}/api/booking/send-invoice/${booking.id}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Backend error");
      }

      const { publicUrl } = data;

      if (!publicUrl) {
        alert("Failed to generate invoice link");
        return;
      }

      const formatDate = (d) => new Date(d).toLocaleDateString("en-IN");

      const message = `
🧾 Booking Invoice
━━━━━━━━━━━━━━
👤 Guest: ${booking.guest}
🏡 Villa: ${booking.villa}
📅 Check-in: ${formatDate(booking.checkIn)}
📅 Check-out: ${formatDate(booking.checkOut)}
💰 Amount: ₹${Number(booking.total_amount).toFixed(2)}

📎 Download Invoice:
${publicUrl}

Thank you for booking with Shivaam Farms & Resorts 🌿
`.trim();

      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    } catch (err) {
      console.error("WhatsApp share failed:", err);
      alert(err.message);
    }
  };

  return (
    <div className="invoice-overlay">
      <div className="invoice-container shadow-lg rounded-3 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold text-success">Invoice</h4>
          <button className="btn btn-outline-danger" onClick={onClose}>
            ✕ Close
          </button>
        </div>

        {/* COMPANY HEADER */}
        <h5 className="fw-bold text-center text-success">{company.name}</h5>
        <p className="text-center small text-muted mb-3">
          {company.address} | {company.phone} |{/* {company.email} */}
        </p>

        {/* GUEST + BOOKING DETAILS */}
        <div className="row mb-3">
          <div className="col-md-6">
            <p>
              <strong>Guest:</strong> {booking.guest}
            </p>
            {/* <p><strong>Email:</strong> {booking.email}</p> */}
            <p>
              <strong>Phone:</strong> {booking.phone || "-"}
            </p>
            <p>
              <strong>Villa:</strong> {booking.villa}
            </p>
          </div>

          <div className="col-md-6 text-md-end">
            <p>
              <strong>Date:</strong> {new Date().toLocaleString()}
            </p>
            <p>
              <strong>Check-in:</strong>{" "}
              {new Date(booking.checkIn).toLocaleDateString()}
            </p>
            <p>
              <strong>Check-out:</strong>{" "}
              {new Date(booking.checkOut).toLocaleDateString()}
            </p>
            <p>
              <strong>Guests:</strong> {booking.guests}
            </p>
          </div>
        </div>

        {/* ITEM TABLE */}
        <table className="table table-bordered text-center align-middle mb-4">
          <thead className="table-success">
            <tr>
              <th>Description</th>
              <th>Rate (₹)</th>
              <th>Qty</th>
              <th>Subtotal (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{booking.villa}</td>
              <td>{booking.base_amount}</td>
              <td>1</td>
              <td>{booking.base_amount}</td>
            </tr>
          </tbody>
        </table>

        {/* GST TABLE */}
        <h6 className="fw-bold mb-2">GST Details</h6>
        <table className="table table-bordered text-center align-middle">
          <thead className="table-warning">
            <tr>
              <th>Tax Type</th>
              <th>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {gstRows.map((row, idx) => (
              <tr
                key={idx}
                className={
                  idx === gstRows.length - 1 ? "table-info fw-bold" : ""
                }
              >
                <td>{row.label}</td>
                <td>₹{row.value.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="table-secondary fw-bold">
              <td>Grand Total</td>
              <td>₹{booking.total_amount}</td>
            </tr>
          </tbody>
        </table>

        {/* EXTRA INFO */}
        <p className="mt-3">
          <strong>Payment Mode:</strong> {booking.payment_mode}
        </p>
        <p>
          <strong>Received By:</strong> {booking.received_by}
        </p>

        {/* TERMS */}
        <div className="mt-4 small">
          <p className="fw-bold">Terms and Conditions:</p>

          {/* <p>For security, 5 member Aadhar cards are required during check-in. They will be returned during check-out.</p> */}

          <p>
            Check-in time is 1:00 PM and check-out time is 11:00 AM. Early
            check-in or late check-out is subject to availability and may incur
            additional charges.
          </p>

          <p>
            Guests are responsible for any damage caused to villa property,
            furniture, fixtures, or electrical appliances during their stay.
          </p>

          <p>
            Outside food delivery is strictly prohibited unless written
            permission is granted by management.
          </p>

          <p>
            Loud music is not allowed after 10:00 PM as per local regulations.
            Guests must maintain decorum and avoid disturbing other residents.
          </p>

          <p>
            Pool usage is at the guest’s own risk. Children must be accompanied
            by adults at all times.
          </p>

          <p>
            Management is not responsible for loss of personal belongings,
            valuables, or unattended items.
          </p>
        </div>

        {/* DOWNLOAD BUTTON */}
        <div className="text-center mt-4">
          <button
            className="btn btn-success"
            onClick={() => {
              console.log("DOWNLOAD BUTTON CLICKED");
              handleDownload();
            }}
          >
            ⬇️ Download Invoice
          </button>
        </div>
        <div className="text-center mt-2">
          <button className="btn btn-primary" onClick={handleShareWhatsApp}>
            📤 Share via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
