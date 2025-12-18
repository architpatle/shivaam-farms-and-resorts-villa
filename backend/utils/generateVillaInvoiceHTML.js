// export const generateVillaInvoiceHTML = (booking) => {
//   const formatDate = (date) =>
//     new Date(date || Date.now()).toLocaleDateString("en-IN");

//   const nights =
//     booking.nights ||
//     Math.max(
//       1,
//       Math.ceil(
//         (new Date(booking.checkOut) - new Date(booking.checkIn)) /
//           (1000 * 60 * 60 * 24)
//       )
//     );

//   const baseAmount = Number(booking.base_amount || booking.baseAmount || 0);
//   const subtotal = baseAmount * nights;

//   const gstRate = 0.18;
//   const gstAmount = subtotal * gstRate;
//   const grandTotal = subtotal + gstAmount;

//   const gstType =
//     booking.gstType?.toLowerCase?.() ||
//     booking.gst_type?.toLowerCase?.() ||
//     "inter";

//   let gstHTML = "";

//   if (gstType === "intra") {
//     const cgst = gstAmount / 2;
//     const sgst = gstAmount / 2;
//     gstHTML = `
//       <tr><td>CGST (9%)</td><td class="text-end">₹ ${cgst.toFixed(2)}</td></tr>
//       <tr><td>SGST (9%)</td><td class="text-end">₹ ${sgst.toFixed(2)}</td></tr>`;
//   } else {
//     gstHTML = `
//       <tr><td>IGST (18%)</td><td class="text-end">₹ ${gstAmount.toFixed(2)}</td></tr>`;
//   }

//   return `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8" />
//   <title>Villa Invoice - ${booking.guest}</title>
//   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//   <style>
//     body {
//       font-family: "Poppins", Arial, sans-serif;
//       background: #f6f8f7;
//       margin: 0;
//       padding: 0;
//     }
//     .invoice-container {
//       max-width: 750px;
//       background: #fff;
//       margin: 20px auto;
//       border-radius: 12px;
//       overflow: hidden;
//       box-shadow: 0 3px 10px rgba(0,0,0,0.1);
//     }
//     .header {
//       padding: 20px;
//     }
//     .header h2 {
//       margin: 0;
//       font-size: 24px;
//       color: #1b8c48;
//       font-weight: 700;
//     }
//     .header p {
//       margin: 3px 0;
//       font-size: 13px;
//     }
//     .invoice-info {
//       text-align: right;
//       font-size: 13px;
//     }
//     .content {
//       padding: 15px 20px 25px;
//     }
//     table {
//       width: 100%;
//       border-collapse: collapse;
//       font-size: 13px;
//     }
//     th, td {
//       padding: 9px;
//       border: 1px solid #ddd;
//     }
//     th {
//       background: #dff2e1;
//       text-align: left;
//     }
//     tr:nth-child(even) {
//       background: #f9f9f9;
//     }
//     .summary-row {
//       font-weight: bold;
//       background: #fff7d6;
//     }
//     .gst-row {
//       background: #e8f6ff;
//       font-weight: bold;
//     }
//     .grand-total {
//       background: #e6ffe6;
//       font-weight: bold;
//       font-size: 15px;
//     }
//     .text-right {
//       text-align: right;
//     }
//     .text-center {
//       text-align: center;
//     }
//     @media screen and (max-width: 600px) {
//       .header, .invoice-info {
//         text-align: center;
//       }
//       .invoice-info {
//         margin-top: 10px;
//       }
//     }
//   </style>
// </head>

// <body>
//   <div class="invoice-container">
//     <div class="header">
//       <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
//         <div>
//           <h2>SHIVAAM FARMS & RESORTS</h2>
//           <p>01, AB, Green Planet, Omkar Nagar</p>
//           <p>Phone: +91 7387750307</p>
//           <p>Email: shivaamfarmsandresorts@gmail.com</p>
//         </div>
//         <div class="invoice-info">
//           <p><b>Invoice To:</b> ${booking.guest}</p>
//           <p><b>Contact:</b> ${booking.phone || "-"}</p>
//           <p><b>Guests:</b> ${booking.guests || "-"}</p>
//           <p><b>Check-in:</b> ${formatDate(booking.checkIn)}</p>
//           <p><b>Check-out:</b> ${formatDate(booking.checkOut)}</p>
//           <p><b>Nights:</b> ${nights}</p>
//           <p><b>Payment Mode:</b> ${booking.payment_mode || "-"}</p>
//           ${booking.received_by ? `<p><b>Received By:</b> ${booking.received_by}</p>` : ""}
//         </div>
//       </div>
//     </div>

//     <div class="content">
//       <table>
//         <thead>
//           <tr>
//             <th>Description</th>
//             <th class="text-center">Rate / Night (₹)</th>
//             <th class="text-center">Nights</th>
//             <th class="text-right">Amount (₹)</th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr>
//             <td>${booking.villa}</td>
//             <td class="text-center">₹ ${baseAmount.toFixed(2)}</td>
//             <td class="text-center">${nights}</td>
//             <td class="text-right">₹ ${subtotal.toFixed(2)}</td>
//           </tr>

//           <tr class="summary-row">
//             <td colspan="3" class="text-right">Sub Total</td>
//             <td class="text-right">₹ ${subtotal.toFixed(2)}</td>
//           </tr>
//         </tbody>
//       </table>

//       <div class="totals" style="margin-top: 15px;">
//         <table>
//           <tr>
//             <th>Tax Type</th>
//             <th class="text-right">Amount (₹)</th>
//           </tr>
//           ${gstHTML}
//           <tr class="gst-row">
//             <td>Total GST</td>
//             <td class="text-right">₹ ${gstAmount.toFixed(2)}</td>
//           </tr>
//           <tr class="grand-total">
//             <td>Grand Total</td>
//             <td class="text-right">₹ ${grandTotal.toFixed(2)}</td>
//           </tr>
//         </table>
//       </div>
//     </div>
//   </div>
// </body>
// </html>`;
// };
