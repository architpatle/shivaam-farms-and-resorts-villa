import express from "express";
import { sendBookingInvoiceToWhatsApp } from "../controllers/bookingInvoiceController.js";

const router = express.Router();

// Generate invoice PDF and return PUBLIC Supabase URL
router.post("/booking/send-invoice/:bookingId", sendBookingInvoiceToWhatsApp);

export default router;
