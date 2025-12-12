// server.js
import "dotenv/config.js";
import cors from "cors";
import express from "express";
import { supabase } from "./config/supabaseClient.js";

import staffRoutes from "./routes/staffRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import revenueRoutes from "./routes/revenue.js";
import expenseRoutes from "./routes/expense.js";
import checkinRoutes from "./routes/checkinRoutes.js";
import bookingInvoiceRoutes from "./routes/bookingInvoiceRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Health check
app.get("/", (req, res) => {
  res.send("✅ Backend is running and connected to Supabase!");
});

// ✅ Mount your routes
app.use("/staff", staffRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api", bookingInvoiceRoutes);
app.use("/api/checkins", checkinRoutes);

// ✅ IMPORTANT — pass supabase client to these route functions
app.use("/api/revenue", revenueRoutes(supabase));
app.use("/api/expenses", expenseRoutes(supabase));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
