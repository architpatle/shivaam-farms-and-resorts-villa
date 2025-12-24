// OverviewCharts.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// Default colors for donut chart
const COLORS = ["#0f9d58", "#2b6cb0", "#f59e0b", "#ef4444", "#8b5cf6", "#6b7280", "#ff7f50", "#40e0d0"];

const getMaxDomain = (data) => {
  if (!data || data.length === 0) return 0;
  const maxRevenue = Math.max(...data.map((item) => item.revenue || 0));
  const maxExpenses = Math.max(...data.map((item) => item.expenses || 0));
  return Math.ceil(Math.max(maxRevenue, maxExpenses) / 1000) * 1000;
};

const OverviewCharts = () => {
  const [chartData, setChartData] = useState([]);
  const [maxDomain, setMaxDomain] = useState(0);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);

  // Fetch bookings (Revenue) and stocks (Expenses)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookingsRes = await axios.get("https://shivaam-farms-and-resorts-villa-kynh.onrender.com/api/bookings");
        const bookings = Array.isArray(bookingsRes.data)
          ? bookingsRes.data
          : bookingsRes.data.bookings || bookingsRes.data.data || [];

        const stocksRes = await axios.get("https://shivaam-farms-and-resorts-villa-kynh.onrender.com/api/stocks");
        const stocks = Array.isArray(stocksRes.data)
          ? stocksRes.data
          : stocksRes.data.stocks || stocksRes.data.data || [];

        // --- Group revenue by month ---
        const revenueByMonth = {};
        bookings.forEach((b) => {
          const date = new Date(b.checkIn || b.created_at);
          const month = date.toLocaleString("default", { month: "short", year: "numeric" });
          const amount = Number(b.customer_payment || 0); // Use customer_payment instead of amount/totalPrice
          revenueByMonth[month] = (revenueByMonth[month] || 0) + amount;
        });

        // --- Group expenses by month ---
        const expenseByMonth = {};
        stocks.forEach((s) => {
          const date = new Date(s.date || s.created_at);
          const month = date.toLocaleString("default", { month: "short", year: "numeric" });
          const amount = Number(s.amount || s.price || 0);
          expenseByMonth[month] = (expenseByMonth[month] || 0) + amount;
        });

        // --- Merge months ---
        const allMonths = Array.from(
          new Set([...Object.keys(revenueByMonth), ...Object.keys(expenseByMonth)])
        ).sort((a, b) => new Date(`1 ${a}`) - new Date(`1 ${b}`));

        const combined = allMonths.map((month) => ({
          month,
          revenue: revenueByMonth[month] || 0,
          expenses: expenseByMonth[month] || 0,
        }));

        setChartData(combined);
        setMaxDomain(getMaxDomain(combined));
      } catch (err) {
        console.error("❌ Failed to fetch chart data:", err);
      }
    };

    fetchData();
  }, []);

  // Fetch stock items for pie chart
  useEffect(() => {
    const fetchExpenseBreakdown = async () => {
      try {
        const res = await axios.get("https://shivaam-farms-and-resorts-villa-kynh.onrender.com/api/stocks");
        const items = res.data;

        const categoryTotals = {};
        items.forEach((item) => {
          const category = item.category || "Other";
          const price = Number(item.price) || 0;
          categoryTotals[category] = (categoryTotals[category] || 0) + price;
        });

        const mappedData = Object.keys(categoryTotals).map((cat, index) => ({
          name: cat,
          value: categoryTotals[cat],
          color: COLORS[index % COLORS.length],
        }));

        setExpenseBreakdown(mappedData);
      } catch (err) {
        console.error("❌ Failed to fetch expense breakdown:", err);
      }
    };

    fetchExpenseBreakdown();
  }, []);

  return (
    <div className="row">
      {/* Expense Breakdown Pie Chart */}
      <div className="col-12 col-md-4 mb-4">
        <div className="card shadow rounded h-100">
          <div className="card-header">
            <h5 className="card-title fw-bolder">Expense Breakdown</h5>
            <small className="text-muted">Based on category totals</small>
          </div>
          <div className="card-body d-flex flex-column align-items-center">
            <div className="w-100" style={{ height: "250px", minHeight: "200px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius="40%"
                    outerRadius="70%"
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="row mt-4 w-100">
              {expenseBreakdown.map((item, index) => (
                <div key={index} className="col-6 d-flex align-items-center mb-2">
                  <div
                    className="rounded-circle me-2"
                    style={{ width: "12px", height: "12px", backgroundColor: item.color }}
                  />
                  <span className="text-muted small">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue vs Expenses Bar Chart */}
      <div className="col-12 col-md-8 mb-4">
        <div className="card shadow rounded h-100">
          <div className="card-header">
            <h5 className="card-title">Revenue vs Expenses</h5>
            <small className="text-muted">Monthly comparison over the last 12 months</small>
          </div>
          <div className="card-body">
            <div style={{ width: "100%", height: 411 }}>
              {chartData.length === 0 ? (
                <p className="text-center text-muted">No data available</p>
              ) : (
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, maxDomain]} />
                    <Tooltip formatter={(value) => `₹${value?.toLocaleString()}`} />
                    <Bar dataKey="revenue" fill="#0f9d58" name="Revenue" />
                    <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewCharts;
