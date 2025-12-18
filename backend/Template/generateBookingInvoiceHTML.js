export const generateBookingInvoiceHTML = (booking) => {
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Invoice</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f4f6f5;
      padding: 20px;
    }

    .invoice {
      background: #ffffff;
      max-width: 800px;
      margin: auto;
      padding: 24px;
      border-radius: 10px;
      border: 1px solid #e0e0e0;
    }

    h2, h3 {
      color: #1b8c48;
      margin-bottom: 5px;
    }

    .company-details {
      text-align: center;
      margin-bottom: 20px;
    }

    .company-details p {
      font-size: 12px;
      color: #555;
      margin: 2px 0;
    }

    .row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .col {
      width: 48%;
      font-size: 14px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      font-size: 14px;
    }

    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: center;
    }

    th {
      background: #dff2e1;
      font-weight: bold;
    }

    .gst th {
      background: #fff3cd;
    }

    .total-row {
      font-weight: bold;
      background: #e3f2fd;
    }

    .grand-total {
      font-weight: bold;
      background: #e9ecef;
    }

    .terms {
      margin-top: 20px;
      font-size: 12px;
      color: #444;
    }

    .terms p {
      margin: 6px 0;
    }
  </style>
</head>
<body>

  <div class="invoice">

    <!-- COMPANY HEADER -->
    <div class="company-details">
      <h2>SHIVAAM FARMS & RESORTS</h2>
      <p>01, AB, Green Planet, Omkar Nagar</p>
      <p>📞 +91 7387750307 | ✉️ shivaamfarmsandresorts@gmail.com</p>
    </div>

    <!-- GUEST + BOOKING DETAILS -->
    <div class="row">
      <div class="col">
        <p><b>Guest:</b> ${booking.guest}</p>
        <p><b>Phone:</b> ${booking.phone || "-"}</p>
        <p><b>Villa:</b> ${booking.villa}</p>
      </div>
      <div class="col" style="text-align:right;">
        <p><b>Date:</b> ${new Date().toLocaleString("en-IN")}</p>
        <p><b>Check-in:</b> ${formatDate(booking.checkIn)}</p>
        <p><b>Check-out:</b> ${formatDate(booking.checkOut)}</p>
        <p><b>Guests:</b> ${booking.guests}</p>
      </div>
    </div>

    <!-- ITEM TABLE -->
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Rate (₹)</th>
          <th>Qty</th>
          <th>Subtotal (₹)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${booking.villa}</td>
          <td>${booking.base_amount}</td>
          <td>1</td>
          <td>${booking.base_amount}</td>
        </tr>
      </tbody>
    </table>

    <!-- GST TABLE -->
    <h3 style="margin-top:20px;">GST Details</h3>
    <table class="gst">
      <thead>
        <tr>
          <th>Tax Type</th>
          <th>Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${
          booking.cgst_amount && booking.sgst_amount
            ? `
            <tr>
              <td>CGST (9%)</td>
              <td>₹${booking.cgst_amount}</td>
            </tr>
            <tr>
              <td>SGST (9%)</td>
              <td>₹${booking.sgst_amount}</td>
            </tr>
          `
            : ""
        }
        ${
          booking.igst_amount
            ? `
            <tr>
              <td>IGST (18%)</td>
              <td>₹${booking.igst_amount}</td>
            </tr>
          `
            : ""
        }
        <tr class="total-row">
          <td>Total GST</td>
          <td>₹${booking.gst_amount}</td>
        </tr>
        <tr class="grand-total">
          <td>Grand Total</td>
          <td>₹${booking.total_amount}</td>
        </tr>
      </tbody>
    </table>

    <!-- PAYMENT INFO -->
    <p style="margin-top:16px;"><b>Payment Mode:</b> ${booking.payment_mode || "-"}</p>
    <p><b>Received By:</b> ${booking.received_by || "-"}</p>

    <!-- TERMS -->
    <div class="terms">
      <p><b>Terms & Conditions:</b></p>
      <p>• Check-in time is 1:00 PM and check-out time is 11:00 AM.</p>
      <p>• Guests are responsible for any damage to property.</p>
      <p>• Outside food delivery is not allowed without permission.</p>
      <p>• Loud music is prohibited after 10:00 PM.</p>
      <p>• Pool usage is at guest’s own risk.</p>
    </div>

  </div>

</body>
</html>
`;
};
