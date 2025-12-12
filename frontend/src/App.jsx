import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";

import Navbar from "./components/Navbar/Navbar.jsx";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import Footer from "./components/Footer/Footer.jsx";

import Dashboard from "./pages/Dashboard";
import Staff from "./pages/Staff.jsx";
import Finance from "./pages/Finance.jsx";
import Booking from "./pages/Booking.jsx";
import Stocks from "./pages/Stocks.jsx";
import CheckInForm from "./pages/CheckInForm.jsx";
import Settings from "./pages/Settings.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";

import ScrollToTop from "./components/ScrollToTop/ScrollToTop.jsx";
import Login from "./pages/Login.jsx";
import Protected from "./Protected.jsx";
import NotAllowed from "./pages/NotAllowed.jsx";


// ⭐ Layout wrapper for hiding sidebar/navbar on login page
function Layout({ children }) {
  const location = useLocation();

  // 🤍 Login page par Navbar & Sidebar hide honge
  const hideLayout = location.pathname === "/login";

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <>
      {!hideLayout && (
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      )}

      <div className="main-content">
        {!hideLayout && <Navbar toggleSidebar={toggleSidebar} />}

        <div className="p-4">{children}</div>

        {!hideLayout && <Footer />}
      </div>
    </>
  );
}

const App = () => {
  return (
    <Router>
      <ScrollToTop />

      <Layout>
        <Routes>

          {/* ⭐ Public Route */}
          <Route path="/login" element={<Login />} />

          {/* ⭐ Protected Routes */}
          <Route
            path="/"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />
          <Route
            path="/staff"
            element={
              <Protected allowedRoles={["admin"]}>
                <Staff />
              </Protected>
            }
          />
          <Route
            path="/finance"
            element={
              <Protected allowedRoles={["admin"]}>
                <Finance />
              </Protected>
            }
          />
          <Route
            path="/booking"
            element={
              <Protected>
                <Booking />
              </Protected>
            }
          />
          <Route
            path="/calendar"
            element={
              <Protected>
                <CalendarPage />
              </Protected>
            }
          />

          <Route
            path="/stocks"
            element={
              <Protected allowedRoles={["admin"]}>
                <Stocks />
              </Protected>
            }
          />
          <Route
            path="/checkInForm"
            element={
              <Protected>
                <CheckInForm />
              </Protected>
            }
          />

          <Route
            path="/settings"
            element={
              <Protected>
                <Settings />
              </Protected>
            }
          />

          <Route
            path="/not-allowed"
            element={
              <Protected>
                <NotAllowed />
              </Protected>
            }
          />

        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
