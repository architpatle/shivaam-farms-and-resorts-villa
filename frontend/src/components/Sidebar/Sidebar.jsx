import React, { useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LuLayoutDashboard } from "react-icons/lu";
import { GoPeople } from "react-icons/go";
import { MdCurrencyRupee } from "react-icons/md";
import { CiCalendar } from "react-icons/ci";
import { LuBox } from "react-icons/lu";
import { FaWpforms } from "react-icons/fa";
import styles from "./Sidebar.module.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  // Auto-close sidebar on route change
  useEffect(() => {
    if (isOpen) toggleSidebar();
  }, [location.pathname]);

  // ✅ FIXED — Properly closed logout function
  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `nav-link d-flex align-items-center text-black mb-2 ${
      isActive ? styles.activeLink : ""
    }`;

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
      <div>
        <div
          className={`${styles.sidebarHeader} d-flex align-items-center justify-content-between mb-4`}
        >
          <h2 className="fs-5 my-0">
            {role === "admin"
              ? "Villa Manager"
              : role === "staff"
              ? "Villa Executive"
              : role?.charAt(0).toUpperCase() + role?.slice(1)}
          </h2>

          {/* Mobile close button */}
          <button
            className="btn btn-sm btn-light d-md-none"
            onClick={toggleSidebar}
          >
            ✖
          </button>
        </div>

        <ul className="nav flex-column p-2">
          <li>
            <NavLink to="/" className={linkClass}>
              <LuLayoutDashboard className="me-2" />
              Dashboard
            </NavLink>
          </li>

          {role === "admin" && (
            <>
              <li>
                <NavLink to="/staff" className={linkClass}>
                  <GoPeople className="me-2" />
                  Staff
                </NavLink>
              </li>

              <li>
                <NavLink to="/finance" className={linkClass}>
                  <MdCurrencyRupee className="me-2" />
                  Finance
                </NavLink>
              </li>

              <li>
                <NavLink to="/stocks" className={linkClass}>
                  <LuBox className="me-2" />
                  Stocks
                </NavLink>
              </li>
            </>
          )}

          <li>
            <NavLink to="/booking" className={linkClass}>
              <CiCalendar className="me-2" />
              Booking
            </NavLink>
          </li>

          <li>
            <NavLink to="/calendar" className={linkClass}>
              <CiCalendar className="me-2" />
              Calendar
            </NavLink>
          </li>

          <li>
            <NavLink to="/checkinform" className={linkClass}>
              <FaWpforms className="me-2" />
              Check-in Form
            </NavLink>
          </li>
        </ul>

        {/* Logout */}
        <div className="ml-5">
          <button className="btn btn-danger px-4 py-2" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;