import { supabase } from "../config/supabaseClient.js";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { getBookingById } from "../models/bookingModel.js";
import { generateBookingInvoiceHTML } from "../Template/generateBookingInvoiceHTML.js";

export const sendBookingInvoiceToWhatsApp = async (req, res) => {
  console.log("🔥 sendBookingInvoiceToWhatsApp HIT");

  try {
    const { bookingId } = req.params;
    console.log("📌 bookingId:", bookingId);

    const result = await getBookingById(Number(bookingId));
    console.log("📦 getBookingById result:", result);

    const { data: booking, error } = result;

    if (error || !booking) {
      console.error("❌ Booking fetch failed:", error);
      return res.status(404).json({ error: "Booking not found" });
    }

    console.log("✅ Booking fetched");

    const html = generateBookingInvoiceHTML(booking);
    console.log("🧾 HTML generated");

    console.log("🚀 Launching Puppeteer...");
    const browser = await puppeteer.launch({
  args: chromium.args,
  defaultViewport: chromium.defaultViewport,
  executablePath: await chromium.executablePath(),
  headless: chromium.headless,
});


    const page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();
    console.log("📄 PDF generated");

    const fileName = `booking_invoice_${bookingId}_${Date.now()}.pdf`;
    console.log("📝 Uploading:", fileName);

    const { error: uploadError } = await supabase.storage
      .from("invoices")
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("❌ Upload failed:", uploadError);
      return res.status(500).json({ error: "Upload failed" });
    }

    const { data } = supabase.storage
      .from("invoices")
      .getPublicUrl(fileName);

    console.log("✅ Public URL:", data.publicUrl);

    res.json({ publicUrl: data.publicUrl });

  } catch (err) {
    console.error("🔥 BOOKING INVOICE ERROR:", err);
    res.status(500).json({ error: "Failed to generate invoice" });
  }
};

