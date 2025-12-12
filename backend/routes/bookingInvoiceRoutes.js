import express from "express";
import { sendBookingInvoiceToWhatsApp } from "../controllers/bookingInvoiceController.js";

const router = express.Router();

// POST → generate PDF and return Supabase URL for WhatsApp
router.post("/booking/send-invoice/:bookingId", sendBookingInvoiceToWhatsApp);

export default router;