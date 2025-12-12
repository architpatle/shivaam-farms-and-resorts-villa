import React from "react";
import { Link, useLocation } from "react-router-dom";
import { GoPeople } from "react-icons/go";
import styles from "./Navbar.module.css";
import logo from "../../assets/images/logo.png"
import { useNavigate } from "react-router-dom";

const Navbar = ({ toggleSidebar }) => {
  const location = useLocation();

  // Map routes to titles
  const pageTitles = {
    "/": "Dashboard",
    "/staff": "Staff",
    "/finance": "Finance",
    "/booking": "Booking",
    "/stocks": "Stocks",
    "/checkinform": "Check In From",
    "/settings": "Settings",
  };

  // Get current title, default "Dashboard"
  const currentTitle = pageTitles[location.pathname] || "Dashboard";

  const navigate = useNavigate();

  return (
    <nav
      className={`${styles.navbar} navbar navbar-expand-lg px-3 py-3 border-bottom`}
    >
      <div className="container-fluid d-flex align-items-center">
        {/* Sidebar toggle button - only visible on small screens */}
        <button
          className="btn btn-dark d-md-none me-3"
          onClick={toggleSidebar}
        >
          ☰
        </button>

        {/* Dynamic Page Title */}
        {/* <span className="navbar-brand fw-bold">{currentTitle}</span> */}
        <img src={logo} style={{ height: "40px" }} alt="" onClick={() => navigate("/")} />

        {/* Push user info to the right */}
        {/* <div className="ms-auto d-flex align-items-center">
          <Link
            className="navbar-brand d-flex align-items-center gap-2 fs-6"
            to="/"
          >
            <GoPeople />
            User Name
          </Link>
        </div> */}
      </div>
    </nav>
  );
};

export default Navbar;
