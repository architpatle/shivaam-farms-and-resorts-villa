// RevenueTable.jsx
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
);

const RevenueTable = () => {
  const [revenueData, setRevenueData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingRevenue = async () => {
      try {
        const res = await axios.get("https://shivaam-farms-and-resorts-villa-kynh.onrender.com/api/bookings");
        const bookings = Array.isArray(res.data)
          ? res.data
          : res.data.bookings || res.data.data || [];

        if (bookings.length > 0) {
          // --- Detect grouping type (monthly or daily) ---
          const monthsSet = new Set(
            bookings.map((b) =>
              new Date(b.checkIn || b.created_at).toLocaleString("default", {
                month: "short",
                year: "numeric",
              })
            )
          );

          let groupedData = {};
          let labels = [];

          if (monthsSet.size === 1) {
            // ✅ Only one month — group by DATE
            bookings.forEach((booking) => {
              const date = new Date(booking.checkIn || booking.created_at);
              const label = date.toLocaleDateString("default", {
                day: "numeric",
                month: "short",
              });
              // ⭐ Use customer_payment as revenue
              const amount = Number(booking.customer_payment || 0);
              groupedData[label] = (groupedData[label] || 0) + amount;
            });

            labels = Object.keys(groupedData);
          } else {
            // ✅ Multiple months — group by MONTH
            bookings.forEach((booking) => {
              const date = new Date(booking.checkIn || booking.created_at);
              const label = date.toLocaleString("default", {
                month: "short",
                year: "numeric",
              });
              // ⭐ Use customer_payment as revenue
              const amount = Number(booking.customer_payment || 0);
              groupedData[label] = (groupedData[label] || 0) + amount;
            });

            labels = Object.keys(groupedData);
          }

          const values = Object.values(groupedData);

          setRevenueData({
            labels,
            datasets: [
              {
                label: monthsSet.size === 1 ? "Daily Revenue" : "Monthly Revenue",
                data: values,
                fill: true,
                backgroundColor: "rgba(34, 197, 94, 0.25)",
                borderColor: "rgba(34, 197, 94, 1)",
                borderWidth: 2,
                pointBackgroundColor: "rgba(34, 197, 94, 1)",
                pointRadius: 4,
                tension: 0.4,
              },
            ],
          });
        } else {
          console.warn("⚠️ No booking data found:", res.data);
          setRevenueData(null);
        }
      } catch (error) {
        console.error("❌ Error fetching booking revenue:", error);
        setRevenueData({});
      } finally {
        setLoading(false);
      }
    };

    fetchBookingRevenue();
  }, []);

  const revenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: true,
        align: "top",
        color: "black",
        font: { weight: "bold" },
        formatter: (value) => `₹${value.toLocaleString()}`,
      },
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `₹${ctx.raw.toLocaleString()}`,
        },
      },
      title: {
        display: true,
        text: "Revenue Overview (From Customer Payment)",
        font: { size: 16, weight: "bold" },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `₹${value}`,
        },
      },
    },
  };

  return (
    <div>
      <h6 className="fw-bold mb-0">Revenue Overview</h6>
      <small className="text-muted">
        {revenueData?.datasets?.[0]?.label || "Based on customer payments"}
      </small>

      <div style={{ height: "420px" }} className="w-100 mt-3">
        {loading ? (
          <p className="text-center text-muted">Loading revenue chart...</p>
        ) : !revenueData?.datasets ? (
          <p className="text-center text-muted">No revenue data available</p>
        ) : (
          <Line data={revenueData} options={revenueOptions} />
        )}
      </div>
    </div>
  );
};

export default RevenueTable;
