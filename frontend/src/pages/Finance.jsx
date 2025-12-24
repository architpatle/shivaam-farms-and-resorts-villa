import React, { useEffect, useState, useRef } from "react";
import OverviewCharts from "../components/FinanceTable/OverviewCharts";
import RecentTransactions from "../components/FinanceTable/RecentTransactions";
import RevenueTable from "../components/FinanceTable/RevenueTable";
import ExpenseTable from "../components/FinanceTable/ExpenseTable";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ChartDataLabels
);

const Finance = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("This Month");

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [netLoss, setNetLoss] = useState(0);

  const [revenue, setRevenue] = useState([]);
  const [months, setMonths] = useState([]);
  const [stockPrices, setStockPrices] = useState([]);
  const [stockLabels, setStockLabels] = useState([]);

  const [transactions, setTransactions] = useState([]);
  const [transactionsForDisplay, setTransactionsForDisplay] = useState([]);
  const transactionsRef = useRef();

  const getStartDateFromRange = (range) => {
    const now = new Date();
    switch (range) {
      case "This Month":
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case "Last Month":
        return new Date(now.getFullYear(), now.getMonth() - 1, 1);
      case "Last 3 Months":
        return new Date(now.getFullYear(), now.getMonth() - 3, 1);
      case "Last 6 Months":
        return new Date(now.getFullYear(), now.getMonth() - 6, 1);
      case "Last Year":
        return new Date(now.getFullYear() - 1, now.getMonth(), 1);
      default:
        return null;
    }
  };

  useEffect(() => {
    let stockData = [];
    let bookingData = [];

    axios
      .get("https://shivaam-farms-and-resorts-villa-kynh.onrender.com/api/stocks")
      .then((res) => {
        if (Array.isArray(res.data)) {
          stockData = res.data.map((item) => ({
            description: `${item.itemname || "Unnamed"} | ${item.villa || "N/A"} | ${
              item.category || "N/A"
            }`,
            date: item.date || new Date().toISOString(),
            amount: Number(item.total_amount ?? item.price ?? 0),
            type: "loss",
            status: "completed",
            receivedBy: item.received_by || "Unknown",
            paymentMode: item.payment_mode || "Cash",
            paymentCategory: "Total",
            source: "Stock",
            advancedAmount: 0,
            remainingAmount: 0,
            gst_type: "-",
            gst_amount: 0,
            cgst_amount: 0,
            sgst_amount: 0,
            igst_amount: 0,
            total_amount: Number(item.price) || 0,
          }));
        }
        return axios.get("https://shivaam-farms-and-resorts-villa-kynh.onrender.com/api/bookings");
      })
      .then((res) => {
        const bookingArray = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
          ? res.data.data
          : [];

        bookingData = bookingArray.map((item) => ({
          description: `${item.guest || "Unknown Guest"} | ${item.villa || "Villa"}`,
          date: item.checkIn || item.created_at || new Date().toISOString(),
          amount: Number(item.customer_payment) || 0,
          customer_payment: Number(item.customer_payment) || 0,
          advancedAmount: 0,
          remainingAmount: 0,
          type: "profit",
          status: item.status || "completed",
          receivedBy: item.received_by || "Customer",
          paymentMode: item.payment_mode || "Online",
          paymentCategory: "Customer Payment",
          source: "Booking",
          gst_type: item.gst_type || "-",
          gst_amount: Number(item.gst_amount) || 0,
          cgst_amount: Number(item.cgst_amount) || 0,
          sgst_amount: Number(item.sgst_amount) || 0,
          igst_amount: Number(item.igst_amount) || 0,
          total_amount: Number(item.customer_payment) || 0,
        }));

        const combined = [...stockData, ...bookingData].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setTransactions(combined);
      })
      .catch((err) => console.error("Error fetching stock/booking data:", err));
  }, []);

  useEffect(() => {
    const startDate = getStartDateFromRange(timeRange);
    const filteredData = startDate
      ? transactions.filter((t) => new Date(t.date) >= startDate)
      : transactions;

    setTransactionsForDisplay(filteredData);

    // ✅ Revenue from Bookings
    const totalBookingRevenue = filteredData
      .filter((t) => t.source === "Booking")
      .reduce((sum, t) => sum + (Number(t.customer_payment) || 0), 0);

    // ✅ Expenses from Stock
    const totalStockExpenses = filteredData
      .filter((t) => t.source === "Stock")
      .reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0);

    setTotalRevenue(totalBookingRevenue);
    setTotalExpenses(totalStockExpenses);

    const profit = totalBookingRevenue - totalStockExpenses;
    setNetProfit(profit > 0 ? profit : 0);
    setNetLoss(profit < 0 ? -profit : 0);

    // Revenue chart data
    const bookingRevenue = filteredData
      .filter((t) => t.source === "Booking")
      .map((t) => Number(t.customer_payment) || 0);

    const bookingMonths = filteredData
      .filter((t) => t.source === "Booking")
      .map((t) =>
        new Date(t.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
      );

    setRevenue(bookingRevenue);
    setMonths(bookingMonths);

    // Expense chart data
    const stockAmounts = filteredData
      .filter((t) => t.source === "Stock")
      .map((t) => Number(t.total_amount) || 0);

    const stockLabels = filteredData
      .filter((t) => t.source === "Stock")
      .map((t, i) => t.date || `Stock ${i + 1}`);

    setStockPrices(stockAmounts);
    setStockLabels(stockLabels);
  }, [timeRange, transactions]);

  const filterOptions = ["This Month", "Last Month", "Last 3 Months", "Last 6 Months", "Last Year"];

  const handleExportPDF = async () => {
    if (!transactionsRef.current) return;
    try {
      const canvas = await html2canvas(transactionsRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("RecentTransactions.pdf");
    } catch (err) {
      console.error("Failed to export PDF:", err);
    }
  };

  const handleExportCSV = (transactions) => {
    if (!transactions || transactions.length === 0) {
      alert("No transactions to export");
      return;
    }

    const exportData = transactions.map((t, i) => ({
      "#": i + 1,
      Source: t.source,
      Description: t.description,
      Date: t.date ? new Date(t.date).toLocaleDateString() : "",
      "Advanced Amount": t.advancedAmount ?? 0,
      "Remaining Amount": t.remainingAmount ?? 0,
      Status: t.status ?? "-",
      "Received By": t.receivedBy ?? "-",
      "Payment Mode": t.paymentMode ?? "-",
      "Payment Category": t.paymentCategory ?? "-",
      "GST Type": t.gst_type ?? "-",
      "GST Amount": Number(t.gst_amount ?? t.gst_amount),

      "CGST Amount": Number(t.cgst_amount ?? 0),
      "SGST Amount": Number(t.sgst_amount ?? 0),
      "IGST Amount": Number(t.igst_amount ?? 0),
      "Total Amount": Number(t.total_amount) || 0,
    }));

    // SUMMARY ROWS
    const grandTotal =
      transactions.reduce(
        (sum, t) => sum + (t.source === "Booking" ? Number(t.total_amount) || 0 : 0),
        0
      ) -
      transactions.reduce(
        (sum, t) => sum + (t.source === "Stock" ? Number(t.total_amount) || 0 : 0),
        0
      );

    const onlineBooking = transactions
      .filter((t) => t.paymentMode === "Online" && t.source === "Booking")
      .reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0);

    const onlineStock = transactions
      .filter((t) => t.paymentMode === "Online" && t.source === "Stock")
      .reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0);

    const cashBooking = transactions
      .filter((t) => t.paymentMode === "Cash" && t.source === "Booking")
      .reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0);

    const cashStock = transactions
      .filter((t) => t.paymentMode === "Cash" && t.source === "Stock")
      .reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0);

    exportData.push(
      {},
      { Description: "Grand Total", "Total Amount": grandTotal },
      {
        Description: "Online Transactions (Booking / Stock)",
        "Total Amount": `${onlineBooking} / ${onlineStock}`,
      },
      {
        Description: "Cash Transactions (Booking / Stock)",
        "Total Amount": `${cashBooking} / ${cashStock}`,
      }
    );

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "RecentTransactions");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "RecentTransactions.xlsx");
  };

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold">Finance Overview</h4>
          <p className="text-muted mb-0">Track revenue, expenses, and profitability</p>
        </div>
        <div className="d-flex gap-2">
          <div className="dropdown">
            <button className="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
              {timeRange}
            </button>
            <ul className="dropdown-menu">
              {filterOptions.map((range) => (
                <li key={range}>
                  <button className="dropdown-item" onClick={() => setTimeRange(range)}>
                    {range}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <button className="btn btn-outline-secondary" onClick={handleExportPDF}>
            Export PDF
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={() => handleExportCSV(transactions)}
          >
            Export CSV/Excel
          </button>
        </div> 
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-3">
          <div className="card p-3 shadow-sm h-100">
            <h6>Total Revenue</h6>
            <h4 className="fw-bold text-dark">₹{totalRevenue.toLocaleString()}</h4>
            <small className="text-success">▲ From Bookings</small>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card p-3 shadow-sm h-100">
            <h6>Total Expenses</h6>
            <h4 className="fw-bold text-dark">₹{totalExpenses.toLocaleString()}</h4>
            <small className="text-danger">▼ From Stocks</small>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card p-3 shadow-sm h-100">
            <h6>Net Profit</h6>
            <h4 className="fw-bold text-success">₹{netProfit.toLocaleString()}</h4>
            <small>▲ Auto calculated</small>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card p-3 shadow-sm h-100">
            <h6>Net Loss</h6>
            <h4 className="fw-bold text-danger">₹{netLoss.toLocaleString()}</h4>
            <small>▼ Auto calculated</small>
          </div>
        </div>
      </div>

      <ul className="nav nav-pills mb-4 flex-wrap">
        {["overview", "revenue", "expenses"].map((tab) => (
          <li className="nav-item" key={tab}>
            <button
              className={`nav-link ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          </li>
        ))}
      </ul>

      <div className="card p-3 shadow-sm mb-4">
        {activeTab === "overview" && <OverviewCharts />}

        {activeTab === "revenue" && (
          <RevenueTable
            key={timeRange}
            revenueData={{
              labels: months.length ? months : ["No Data"],
              datasets: [
                {
                  label: "Revenue (customer payment)",
                  data: revenue.length ? revenue : [0],
                  fill: true,
                  backgroundColor: "rgba(75,192,192,0.2)",
                  borderColor: "rgba(75,192,192,1)",
                  pointRadius: 4,
                  tension: 0.3,
                },
              ],
            }}
            revenueOptions={{
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        )}

        {activeTab === "expenses" && (
          <div style={{ width: "100%", height: "400px" }}>
            <ExpenseTable
              expensesData={{
                labels: stockLabels.length ? stockLabels : ["No Data"],
                datasets: [
                  {
                    label: "Expense (Stock Price)",
                    data: stockPrices.length ? stockPrices : [0],
                    fill: true,
                    backgroundColor: "rgba(255, 99, 132, 0.16)",
                    borderColor: "red",
                    pointBackgroundColor: "red",
                    pointRadius: 4,
                    tension: 0.3,
                  },
                ],
              }}
              expensesOptions={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        )}
      </div>

      <div ref={transactionsRef}>
        <RecentTransactions transactions={transactionsForDisplay} />
      </div>
    </div>
  );
};

export default Finance;
