import React, { useState, useEffect } from "react";
import Card from "../components/Card/Card";
import CardBasic from "../components/CardBasic/CardBasic";
import RecentActivity from "../components/RecentActivity/RecentActivity";
import { CiCalendar } from "react-icons/ci";
import { MdCurrencyRupee } from "react-icons/md";
import { GoPeople } from "react-icons/go";
import { LuBox } from "react-icons/lu";
import { getStaff } from "../service/staffApi";
// import { useNavigate } from "react-router-dom";
import CheckAvailability from "../components/CheckAvailability/CheckAvailability";

const Dashboard = () => {
  // === States ===
  // const navigate = useNavigate();
  const [staffCount, setStaffCount] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [items, setItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [showLowStockModal, setShowLowStockModal] = useState(false);

  const role = localStorage.getItem("role");
  const isExecutive = role === "executive";

  // ✅ Logout Function
  // const handleLogout = () => {
  //   localStorage.removeItem("loggedIn");
  //   navigate("/login");
  // };

  // === Fetch Staff Count ===
  useEffect(() => {
    const fetchStaffCount = async () => {
      try {
        const data = await getStaff();
        setStaffCount(data.length || 0);
      } catch (err) {
        console.error("Failed to fetch staff count:", err);
      }
    };
    fetchStaffCount();
  }, []);

  // === Fetch Bookings (for total & revenue) ===
  useEffect(() => {
    const fetchBookingsData = async () => {
      try {
        const res = await fetch("https://shivaam-farms-and-resorts-villa.onrender.com/api/bookings");
        const { data } = await res.json();
        setTotalBookings(data.length || 0);

        const totalRev = data.reduce(
          (sum, item) => sum + (Number(item.customer_payment) || 0),
          0
        );

        setTotalRevenue(totalRev);
      } catch (err) {
        console.error("Failed to fetch bookings data:", err);
      }
    };
    fetchBookingsData();
  }, []);

  // === Fetch Stock Data ===
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const res = await fetch("https://shivaam-farms-and-resorts-villa.onrender.com/api/stocks");
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Error fetching stocks:", err);
      }
    };
    fetchStocks();
  }, []);

  // === Handle Low Stock Click ===
  const handleLowStockClick = () => {
    const filtered = items.filter(
      (item) => Number(item.current_stock) <= Number(item.min_stock)
    );
    setLowStockItems(filtered);
    setShowLowStockModal(true);
  };

  // === Modal Styles ===
  const modalOverlay = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  };

  const modalBox = {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "500px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
  };

  // === Stock Health Percentage ===
  const totalItems = items.length;
  const lowItems = items.filter(
    (item) => Number(item.current_stock) <= Number(item.min_stock)
  ).length;
  const stockHealth =
    totalItems > 0
      ? `${Math.round(((totalItems - lowItems) / totalItems) * 100)}%`
      : "0%";

  // === Render ===
  return (
    <div className="overviewContainer container">
      {/* ✅ LOGOUT BUTTON (Top Right) */}
      {/* <div className="d-flex justify-content-end mt-3">
        <button
          className="btn btn-danger px-4 py-2"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div> */}
      <div className="py-3">
        <h2 className="fs-4 fw-500">Check Availability</h2>
        <CheckAvailability />
      </div>
      <div className="py-4">
        {/* --- Quick Actions --- */}
        <h2 className="fs-4 fw-500">Quick Actions</h2>
        <div className="row g-3 justify-content-center pb-4">
          <CardBasic
            cardTitle={"New Booking"}
            cardText={"Add a new villa booking"}
            cardColor={"#B7E4C7"}
            navigateTo="/booking"
          />
          <CardBasic
            cardTitle={"Check-in Form"}
            cardText={"Add new check-in entry"}
            cardColor={"#A3CCDA"}
            navigateTo="/checkinform"
          />
          <CardBasic
            cardTitle={"Stock Update"}
            cardText={"Update inventory levels"}
            cardColor={"#FFF3B0"}
            navigateTo="/stocks"
          />
        </div>

        {/* --- Overview --- */}
        <div
          className={`row g-3 pb-4 ${isExecutive ? "justify-content-start" : "justify-content-center"
            }`}
        >
          <h2 className="fs-4 fw-500">Overview</h2>

          {/* Always visible */}
          <Card
            cardTitle={"Total Bookings"}
            cardIcon={<CiCalendar fontSize={20} color="#000000" />}
            cardSubtitle={totalBookings.toString()}
          />

          {/* Hide these 3 cards for EXECUTIVE */}
          {!isExecutive && (
            <>
              <Card
                cardTitle={"Total Revenue"}
                cardIcon={<MdCurrencyRupee fontSize={20} color="#000000" />}
                cardSubtitle={`₹${totalRevenue.toLocaleString()}`}
              />

              <Card
                cardTitle={"Total Staff"}
                cardIcon={<GoPeople fontSize={20} color="#000000" />}
                cardSubtitle={staffCount.toString()}
              />

              <Card
                cardTitle={"Stock Status"}
                cardIcon={<LuBox fontSize={20} color="#000000" />}
                cardSubtitle={stockHealth}
                style={{ cursor: "pointer" }}
                onClick={handleLowStockClick}
              />
            </>
          )}
        </div>

        {/* --- Low Stock Modal --- */}
        {showLowStockModal && (
          <div style={modalOverlay}>
            <div style={modalBox}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold">Low Stock Items</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowLowStockModal(false)}
                ></button>
              </div>

              <div className="border rounded p-3 bg-light">
                <h6 className="text-danger fw-semibold mb-2">
                  Items that need immediate attention
                </h6>

                {lowStockItems.length > 0 ? (
                  lowStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="d-flex justify-content-between align-items-center bg-white border rounded p-3 mb-2 shadow-sm"
                    >
                      <div>
                        <div className="fw-semibold">{item.itemname}</div>
                        <small className="text-muted">
                          {item.current_stock} remaining (min: {item.min_stock})
                        </small>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted mb-0">
                    No low stock items found.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- Recent Activity --- */}
        {/* <div className="py-4">
          <h2 className="fs-4 fw-500">Recent Activity</h2>
          <RecentActivity />
        </div> */}
      </div>
    </div>
  );
};

export default Dashboard;
