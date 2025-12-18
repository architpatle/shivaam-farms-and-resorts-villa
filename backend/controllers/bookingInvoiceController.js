import { supabase } from "../config/supabaseClient.js";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { getBookingById } from "../models/bookingModel.js";
import { generateBookingInvoiceHTML } from "../Template/generateBookingInvoiceHTML.js";

export const sendBookingInvoiceToWhatsApp = async (req, res) => {
  console.log("🔥 sendBookingInvoiceToWhatsApp HIT");

  // ✅ Parse bookingId ONCE
  const bookingId = Number(req.params.bookingId);
  console.log("📌 bookingId:", bookingId);

  if (!bookingId || isNaN(bookingId)) {
    return res.status(400).json({
      error: "Invalid bookingId",
    });
  }

  try {
    // 1️⃣ Fetch booking
    const { data: booking, error } = await getBookingById(bookingId);
    console.log("📦 getBookingById result:", booking);

    if (error || !booking) {
      console.error("❌ Booking fetch failed:", error);
      return res.status(404).json({ error: "Booking not found" });
    }

    console.log("✅ Booking fetched");

    // 2️⃣ Generate invoice HTML
    const html = generateBookingInvoiceHTML(booking);
    console.log("🧾 HTML generated");

    // 3️⃣ Launch Puppeteer
    console.log("🚀 Launching Puppeteer...");

    let browser;

    if (process.env.RENDER) {
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } else {
      browser = await puppeteer.launch({
        headless: true,
        executablePath:
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        args: ["--no-sandbox"],
      });
    }

    console.log("✅ Puppeteer launched");

    // 4️⃣ Render PDF
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 0,
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();
    console.log("📄 PDF generated");

    // 5️⃣ Upload to Supabase
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
      return res.status(500).json({ error: uploadError.message });
    }

    // 6️⃣ Get public URL
    const { data } = supabase.storage
      .from("invoices")
      .getPublicUrl(fileName);

    console.log("✅ Public URL:", data.publicUrl);

    // 7️⃣ Respond
    return res.json({ publicUrl: data.publicUrl });
  } catch (err) {
    console.error("🔥 BOOKING INVOICE ERROR:", err);
    return res.status(500).json({
      error: err.message || "Failed to generate invoice",
    });
  }
};
