import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import SearchBookingPopup from "../components/BookingSearchPopup/BookingSearchPopup.jsx";

const CheckInForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    checkInTime: "",
    checkOutTime: "",
    guests: "",
    villa: "",
    paymentMode: "Cash",
    advance: "",
    balance: "",
    total: "",
  });

  const [showSearch, setShowSearch] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [allBookings, setAllBookings] = useState([]);
  const role = localStorage.getItem("role");
  const isExecutive = role === "executive";

  // 🔹 Fetch existing check-ins from backend on component mount
  useEffect(() => {
    const fetchCheckIns = async () => {
      try {
        const res = await fetch("https://shivaam-farms-and-resorts-villa.onrender.com/api/checkins");
        const data = await res.json();
        if (data.success) {
          const mappedData = data.data.map((item) => ({
            firstName: item.first_name,
            lastName: item.last_name,
            phone: item.phone,
            checkIn: item.check_in,
            checkOut: item.check_out,
            checkInTime: item.check_in_time,
            checkOutTime: item.check_out_time,
            villa: item.villa,
            guests: item.guests,
            paymentMode: item.payment_mode,
            advance: item.advance,
            balance: item.balance,
            total: item.total,
          }));

          // ✅ Remove duplicates (based on phone + villa + checkIn)
          const uniqueReservations = mappedData.filter(
            (item, index, self) =>
              index ===
              self.findIndex(
                (r) =>
                  r.phone === item.phone &&
                  r.villa === item.villa &&
                  r.checkIn === item.checkIn
              )
          );

          // ✅ Sort by most recent check-in date
          uniqueReservations.sort(
            (a, b) => new Date(b.checkIn) - new Date(a.checkIn)
          );

          setReservations(uniqueReservations);
        }
      } catch (err) {
        console.error("❌ Error fetching check-ins:", err);
      }
    };

    fetchCheckIns();
  }, []);

  const openSearch = async () => {
    try {
      const res = await fetch("https://shivaam-farms-and-resorts-villa.onrender.com/api/bookings");
      const data = await res.json();
      setAllBookings(data.data || []);
      setShowSearch(true);
    } catch (err) {
      console.error("❌ Error fetching bookings:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://shivaam-farms-and-resorts-villa.onrender.com/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save check-in");

      // Refetch all check-ins (your existing code)
      const fetchRes = await fetch("https://shivaam-farms-and-resorts-villa.onrender.com/api/checkins");
      const fetchedData = await fetchRes.json();
      if (fetchedData.success) {
        const mappedData = fetchedData.data.map((item) => ({
          firstName: item.first_name,
          lastName: item.last_name,
          phone: item.phone,
          checkIn: item.check_in,
          checkOut: item.check_out,
          checkInTime: item.check_in_time,
          checkOutTime: item.check_out_time,
          villa: item.villa,
          guests: item.guests,
          paymentMode: item.payment_mode,
          advance: item.advance,
          balance: item.balance,
          total: item.total_amount,
        }));

        const uniqueReservations = mappedData.filter(
          (item, index, self) =>
            index ===
            self.findIndex(
              (r) =>
                r.phone === item.phone &&
                r.villa === item.villa &&
                r.checkIn === item.checkIn
            )
        );

        uniqueReservations.sort(
          (a, b) => new Date(b.checkIn) - new Date(a.checkIn)
        );

        setReservations(uniqueReservations);
      }

      alert("✅ Check-in saved successfully!");

      // 🔹 Reset form AND popup data
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        checkIn: "",
        checkOut: "",
        checkInTime: "",
        checkOutTime: "",
        guests: "",
        villa: "",
        paymentMode: "Cash",
        advance: "",
        balance: "",
        total: "",
      });

      setAllBookings([]); // Clear bookings from popup
      setShowSearch(false); // Ensure popup is closed
    } catch (err) {
      console.error("❌ Error submitting check-in:", err);
      alert("❌ Failed to save check-in data.");
    }
  };

  const handleSelectBooking = (booking) => {
    try {
      let firstName = "";
      let lastName = "";
      if (booking.guest) {
        const parts = booking.guest.trim().split(" ");
        firstName = parts[0];
        lastName = parts.slice(1).join(" ");
      }

      setFormData((prev) => ({
        ...prev,
        villa: booking.villa,
        guests: booking.guests || 1,
        paymentMode: booking.payment_mode || "Cash",
        advance: booking.advanced_amount || 0,
        balance: booking.remaining_amount || 0,
        total: booking.total || booking.total_amount || 0,
        firstName,
        lastName,
        phone: booking.phone || "",
        checkIn: booking.check_in,
        checkOut: booking.check_out,
      }));

      setShowSearch(false);
    } catch (error) {
      console.error("❌ Error selecting booking:", error);
    }
  };

  const filteredReservations = reservations.filter(
    (res) =>
      res.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      res.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      res.phone?.toLowerCase().includes(search.toLowerCase()) ||
      res.villa?.toString().includes(search.toLowerCase())
  );

  const dateFilteredReservations = filteredReservations.filter((res) => {
    if (!startDate && !endDate) return true;
    const checkInDate = new Date(res.checkIn);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (start && checkInDate < start) return false;
    if (end && checkInDate > end) return false;
    return true;
  });

  const exportToCSV = () => {
    if (dateFilteredReservations.length === 0) {
      alert("No reservations found in this date range.");
      return;
    }

    const headers = [
      "Name",
      "Phone",
      "Villa",
      "Guests",
      "Check-in",
      "Check-out",
      "Payment Mode",
      "Advance",
      "Balance",
      "Total",
    ];
    const rows = dateFilteredReservations.map((res) => [
      `${res.firstName} ${res.lastName}`,
      res.phone,
      res.villa,
      res.guests,
      `${res.checkIn || ""} ${res.checkInTime || ""}`,
      `${res.checkOut || ""} ${res.checkOutTime || ""}`,
      res.paymentMode,
      res.advance,
      res.balance,
      res.total,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));

    const fileNameParts = ["reservations"];
    if (startDate) fileNameParts.push(startDate);
    if (endDate) fileNameParts.push(endDate);
    const fileName = `${fileNameParts.join("_")}.csv`;

    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container my-4" style={{ maxWidth: "900px" }}>
      {/* Check-In Form */}
      <div className="card shadow p-4 mb-4">
        <div className="d-flex align-items-center justify-content-between">
          <h4 className="fw-bold mb-3">Check-In Form</h4>
          <button className="btn btn-outline-primary" type="button" onClick={openSearch}>
            Search Booking
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col">
              <input
                type="text"
                className="form-control"
                placeholder="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col">
              <input
                type="text"
                className="form-control"
                placeholder="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="mb-3">
            <input
              type="tel"
              className="form-control"
              placeholder="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="row mb-3">
            <div className="col">
              <label className="form-label">Check-in Date</label>
              <input
                type="date"
                className="form-control"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col">
              <label className="form-label">Check-out Date</label>
              <input
                type="date"
                className="form-control"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col">
              <label className="form-label">Check-in Time</label>
              <input
                type="time"
                className="form-control"
                name="checkInTime"
                value={formData.checkInTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col">
              <label className="form-label">Check-out Time</label>
              <input
                type="time"
                className="form-control"
                name="checkOutTime"
                value={formData.checkOutTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col">
              <input
                type="text"
                className="form-control"
                placeholder="Villa No."
                name="villa"
                value={formData.villa}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col">
              <input
                type="number"
                className="form-control"
                placeholder="Number of Guests"
                name="guests"
                value={formData.guests}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col">
              <label className="form-label">Payment Mode</label>
              <select
                className="form-select"
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
              >
                <option value="Cash">Cash</option>
                <option value="Online">Online</option>
                <option value="Card">Card</option>
              </select>
            </div>
            <div className="col">
              <label className="form-label">Advance</label>
              <input
                type="number"
                className="form-control"
                name="advance"
                value={formData.advance}
                onChange={handleChange}
              />
            </div>
            <div className="col">
              <label className="form-label">Balance</label>
              <input
                type="number"
                className="form-control"
                name="balance"
                value={formData.balance}
                onChange={handleChange}
              />
            </div>
            <div className="col">
              <label className="form-label">Total</label>
              <input
                type="number"
                className="form-control"
                name="total"
                value={formData.total}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="d-flex justify-content-center">
            <button type="submit" className="btn btn-success border-0">
              Submit
            </button>
          </div>
        </form>
      </div>

      {/* Checked-in Guests Table */}
      <div className="card shadow p-4">
        <h3 className="mb-3">Checked-in Guests</h3>
        <input
          type="text"
          placeholder="Search by name, phone, or villa"
          className="form-control mb-3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="row g-3 mb-3">
          <div className="col-12 col-md-6 col-lg-4">
            <label className="form-label mb-1">Start Date</label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-6 col-lg-4">
            <label className="form-label mb-1">End Date</label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-12 col-lg-4">
            <div className="d-flex h-100 align-items-end">
              <button className="btn btn-primary w-100" onClick={exportToCSV} type="button">
                Export CSV
              </button>
            </div>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-bordered text-center">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Villa</th>
                <th>Guests</th>
                <th>Check-in</th>
                <th>Check-out</th>
                {!isExecutive && <th>Payment Mode</th>}
                {!isExecutive && <th>Advance</th>}
                {!isExecutive && <th>Balance</th>}
                {!isExecutive && <th>Total</th>}
              </tr>
            </thead>
            <tbody>
              {dateFilteredReservations.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-muted">
                    No data available
                  </td>
                </tr>
              ) : (
                dateFilteredReservations.map((res, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{res.firstName} {res.lastName}</td>
                    <td>{res.phone}</td>
                    <td>{res.villa}</td>
                    <td>{res.guests}</td>
                    <td>{res.checkIn || ""} {res.checkInTime || ""}</td>
                    <td>{res.checkOut || ""} {res.checkOutTime || ""}</td>
                    {!isExecutive && <td>{res.paymentMode}</td>}
                    {!isExecutive && <td>{res.advance}</td>}
                    {!isExecutive && <td>{res.balance}</td>}
                    {!isExecutive && <td>{res.total}</td>}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Search Popup */}
      {showSearch && (
        <SearchBookingPopup
          bookings={allBookings}
          onClose={() => setShowSearch(false)}
          onSelect={handleSelectBooking}
        />
      )}
    </div>
  );
};

export default CheckInForm;
