import { supabase } from "../config/supabaseClient.js";
import { getBookingById } from "../models/bookingModel.js";
import { generateBookingInvoicePDF } from "../utils/generateBookingInvoice.js";

export const sendBookingInvoiceToWhatsApp = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // 1️⃣ Fetch booking data
    const { data: booking, error } = await getBookingById(Number(bookingId));
    if (error) throw error;
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // 2️⃣ Generate PDF bytes
    const pdfBytes = await generateBookingInvoicePDF(booking);
    const fileBuffer = Buffer.from(pdfBytes);

    // 3️⃣ Upload to Supabase (CORRECTED)
    const fileName = `booking_invoice_${bookingId}_${Date.now()}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("invoices")        // bucket name ONLY
      .upload(fileName, fileBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      return res.status(500).json({ error: uploadError.message });
    }

    // 4️⃣ Get public URL (CORRECTED)
    const { data: publicData } = supabase.storage
      .from("invoices")
      .getPublicUrl(fileName);

    console.log("✅ Invoice uploaded:", publicData.publicUrl);

    res.json({ publicUrl: publicData.publicUrl });

  } catch (err) {
    console.error("❌ sendBookingInvoiceToWhatsApp error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
