import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const generateBookingInvoicePDF = async (booking) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y = 760;

  const write = (text, size = 14, color = rgb(0, 0, 0)) => {
    page.drawText(text, { x: 50, y, size, font, color });
    y -= 25;
  };

  // Header
  write("SHIVAAM FARMS & RESORTS", 20, rgb(0, 0.5, 0));
  write("01, AB, Green Planet, Omkar Nagar", 12);
  write("Phone: +91 7387750307 | shivaamfarmsandresorts@gmail.com", 12);
  y -= 20;

  write("------ BOOKING INVOICE ------", 16);

  // Booking info
  write(`Guest: ${booking.guest}`);
  write(`Villa: ${booking.villa}`);
  write(`Check-in: ${new Date(booking.check_in).toLocaleDateString()}`);
  write(`Check-out: ${new Date(booking.check_out).toLocaleDateString()}`);
  write(`Guests: ${booking.guests}`);
  y -= 10;

  // Amount info
  write(`Base Amount: Rs. ${booking.base_amount}`);
  write(`GST Amount: Rs. ${booking.gst_amount}`);
  write(`Total Amount: Rs. ${booking.total_amount}`, 16, rgb(0, 0.5, 0));

  // Footer
  y -= 30;
  write("Thank you for booking with Shivaam Farms & Resorts!", 12);

  const pdfBytes = await pdfDoc.save(); // returns Uint8Array buffer
  return pdfBytes;
};
