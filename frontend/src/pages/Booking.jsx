import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaUserFriends,
  FaEdit,
  FaPlus,
  FaFileCsv,
  FaTrash,
} from "react-icons/fa";
import { CiCalendar } from "react-icons/ci";
import { GoPeople } from "react-icons/go";
import Calendar from "../components/Calendar/Calendar";
import NewBooking from "../components/NewBooking/NewBooking";
import EditBooking from "../components/EditBooking/EditBooking";
import Invoice from "../components/Invoice/Invoice";
import "./Booking.css";

// ---------------- CSV Export ----------------
const exportToCSV = (rows, filename) => {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((r) =>
      headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")
    )].join("\n");

  const link = document.createElement("a");
  link.href = encodeURI(csvContent);
  link.download = `${filename}.csv`;
  link.click();
};

// ---------------- Card Component ----------------
const Card = ({ cardTitle, cardIcon, cardSubtitle }) => (
  <div className="col-12 col-sm-6 col-lg-4">
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <h6 className="mb-0">{cardTitle}</h6>
          {cardIcon}
        </div>
        <h4 className="fw-bold mt-2">{cardSubtitle}</h4>
      </div>
    </div>
  </div>
);

const Booking = () => {
  const [activeView, setActiveView] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [showEditBooking, setShowEditBooking] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  const [bookings, setBookings] = useState([]);

  // Filters
  const filteredBookings = bookings.filter(
    (b) =>
      (statusFilter === "All Status" || b.status === statusFilter) &&
      (b.guest.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.villa.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Current stats
  const totalBookings = bookings.length;
  const currentGuests = bookings.reduce((sum, b) => sum + (b.guests || 0), 0);
  const occupancyRate = bookings.length
    ? Math.round((currentGuests / (bookings.length * 4)) * 100)
    : 0;

  // Mock previous month data
  const prevMonthBookings = 10;
  const prevMonthGuests = 20;
  const prevMonthOccupancy = 50;

  // Growth % calculations
  const bookingGrowth =
    prevMonthBookings > 0
      ? (((totalBookings - prevMonthBookings) / prevMonthBookings) * 100).toFixed(1)
      : "0";
  const guestGrowth =
    prevMonthGuests > 0
      ? (((currentGuests - prevMonthGuests) / prevMonthGuests) * 100).toFixed(1)
      : "0";
  const occupancyGrowth =
    prevMonthOccupancy > 0
      ? (((occupancyRate - prevMonthOccupancy) / prevMonthOccupancy) * 100).toFixed(1)
      : "0";

  const fetchBookings = async () => {
    try {
      const res = await fetch("https://shivaam-farms-and-resorts-villa.onrender.com/api/bookings");
      const json = await res.json();

      if (!json.data) return;

      const mappedBookings = json.data.map((b) => ({
        id: b.id,
        guest: b.guest,
        // email: b.email,
        phone: b.phone,
        villa: b.villa,
        checkIn: b.check_in,
        checkOut: b.check_out,
        nights: b.nights,
        guests: b.guests,
        status: b.status,
        base_amount: Number(b.base_amount || 0),
        gst_type: b.gst_type || "",
        cgst_amount: Number(b.cgst_amount || 0),
        sgst_amount: Number(b.sgst_amount || 0),
        igst_amount: Number(b.igst_amount || 0),
        gst_amount: Number(b.gst_amount || 0),
        total_amount: Number(b.total_amount || 0),
        advanced_amount: Number(b.advanced_amount || 0),
        // remaining_amount: Number(b.remaining_amount || 0),
        payment_mode: b.payment_mode,
        payment_category: b.payment_category,
        received_by: b.received_by,
        address: b.address,
        // aadhar: b.aadhar,
      }));

      setBookings(mappedBookings.sort((a, b) => Number(b.id) - Number(a.id)));
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleDeleteBooking = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;

    try {
      const res = await fetch(`https://shivaam-farms-and-resorts-villa.onrender.com/api/bookings/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        setBookings(bookings.filter((b) => b.id !== id));
        alert("Booking deleted successfully");
      } else {
        alert("Failed to delete booking");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting booking");
    }
  };

  const handleSaveEditedBooking = async (updatedBooking) => {
    const bookingId = updatedBooking.id || selectedBooking?.id;
    if (!bookingId) return;

    try {
      const response = await fetch(
        `https://shivaam-farms-and-resorts-villa.onrender.com/api/bookings/${bookingId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedBooking),
        }
      );
      const result = await response.json();
      if (response.ok) await fetchBookings();
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  return (
    <div className="container my-4">
      {/* Title + New Booking */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold mb-1">Booking Management</h3>
          <p className="text-muted mb-0">
            Manage villa reservations and guest bookings
          </p>
        </div>
        <button
          className="btn btn-success d-flex align-items-center"
          onClick={() => setShowNewBooking(true)}
        >
          <FaPlus className="me-2" /> New Booking
        </button>
      </div>

      {/* Cards */}
      <div className="row g-3 justify-content-center mb-4">
        <Card
          cardTitle="Total Bookings"
          cardIcon={<CiCalendar fontSize={20} />}
          cardSubtitle={totalBookings.toString()}
        />
        <Card
          cardTitle="Current Guests"
          cardIcon={<GoPeople fontSize={20} />}
          cardSubtitle={currentGuests.toString()}
        />
        <Card
          cardTitle="Occupancy Rate"
          cardIcon={<GoPeople fontSize={20} />}
          cardSubtitle={`${occupancyRate}%`}
        />
      </div>

      {/* Toggle Section */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div className="d-flex gap-2 flex-wrap">
              <button
                className={`btn ${activeView === "list" ? "btn-success" : "btn-outline-success"}`}
                onClick={() => setActiveView("list")}
              >
                Booking List
              </button>
              <button
                className={`btn ${activeView === "calendar" ? "btn-success" : "btn-outline-success"}`}
                onClick={() => setActiveView("calendar")}
              >
                Calendar View
              </button>
            </div>

            <div className="d-flex gap-2 flex-wrap">
              <button
                className="btn btn-success d-flex align-items-center"
                onClick={() => exportToCSV(filteredBookings, "Bookings")}
              >
                <FaFileCsv className="me-2" /> Export CSV
              </button>
            </div>
          </div>

          {activeView === "list" ? (
            <>
              {/* Table Header + Search */}
              <div className="mb-3">
                <h5 className="fw-bold">All Bookings</h5>
                <p className="text-muted mb-3">Manage and track all villa reservations</p>

                <div className="d-flex gap-2 mt-3 flex-wrap">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search bookings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option>All Status</option>
                    <option>Confirmed</option>
                    <option>Pending</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>

              <div className="table-responsive" style={{ overflowX: "auto", whiteSpace: "nowrap", WebkitOverflowScrolling: "touch" }}>
                <table className="table table-hover align-middle">
                  <thead className="table-light text-center">
                    <tr>
                      <th>Guest Name</th>
                      <th>Villa</th>
                      <th>Dates</th>
                      <th>Guests</th>
                      <th>Status</th>
                      <th>Received By</th>
                      <th>Base Amount (₹)</th>
                      <th>GST Type</th>
                      <th>CGST (₹)</th>
                      <th>SGST (₹)</th>
                      <th>IGST (₹)</th>
                      <th>GST Total (₹)</th>
                      <th>Total Amount (₹)</th>
                      <th>Advance (₹)</th>
                      <th>Balance</th>
                      <th>Payment Mode</th>
                      <th>Payment Category</th>
                      <th>Customer Payment (₹)</th>
                      {/* <th>Aadhar</th> */}
                      <th>Address</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody className="text-center">
                    {filteredBookings.map((b, index) => (
                      <tr key={index}>
                        <td className="text-sm-start text-center">
                          <div className="fw-bold">{b.guest}</div>
                          {/* <small className="text-muted">{b.email}</small> */}
                        </td>
                        <td>
                          <div className="d-flex align-items-center justify-content-center">
                            <FaHome className="me-2 text-warning" size={16} />
                            <span>{b.villa}</span>
                          </div>
                        </td>
                        <td>
                          {new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}
                          <div><small className="text-muted">{b.nights} nights</small></div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center justify-content-center">
                            <FaUserFriends className="me-2 text-primary" size={16} />
                            <span>{b.guests}</span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge rounded-pill px-3 py-2 ${
                              b.payment_category === "Total" || Number(b.remaining_amount) === 0
                                ? "bg-success-subtle text-success"
                                : b.status === "Pending"
                                ? "bg-warning-subtle text-warning"
                                : "bg-primary-subtle text-primary"
                            }`}
                          >
                            {b.payment_category === "Total" || Number(b.remaining_amount) === 0 ? "Confirmed" : b.status}
                          </span>
                        </td>
                        <td>{b.received_by || "-"}</td>
                        <td>₹ {b.base_amount}</td>
                        <td>{b.gst_type}</td>
                        <td>₹ {b.cgst_amount}</td>
                        <td>₹ {b.sgst_amount}</td>
                        <td>₹ {b.igst_amount}</td>
                        <td>₹ {b.gst_amount}</td>
                        <td>₹ {b.total_amount}</td>
                        <td>₹ {b.advanced_amount}</td>
                        <td>{b.payment_category === "Advanced" ? `₹ ${b.remaining_amount || 0}` : b.payment_category === "Total" ? "0" : "-"}</td>
                        <td>{b.payment_mode || "-"}</td>
                        <td>{b.payment_category || "-"}</td>
                        <td>{b.payment_category === "Advanced" ? `₹ ${b.advanced_amount || 0}` : `₹ ${b.total_amount || 0}`}</td>
                        {/* <td>{b.aadhar}</td> */}
                        <td style={{ maxWidth: "200px", whiteSpace: "normal" }}>{b.address}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-1" onClick={() => { setSelectedBooking(b); setShowEditBooking(true); }}>
                            <FaEdit />
                          </button>
                          <button className="btn btn-sm btn-outline-danger px-2 me-1" onClick={() => handleDeleteBooking(b.id)}>
                            <FaTrash />
                          </button>
                          <button className="btn btn-sm btn-outline-primary px-2 me-1" onClick={() => setShowInvoice(true)}>
                            <FaFileCsv />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <Calendar
              onDateSelect={(date, villa) => console.log("Selected Date:", date, "Villa:", villa)}
              bookedDatesByVilla={bookings.reduce((acc, b) => {
                if (!acc[b.villa]) acc[b.villa] = [];
                if (b.checkIn && b.checkOut) {
                  const start = new Date(b.checkIn);
                  const end = new Date(b.checkOut);
                  const current = new Date(start);
                  while (current <= end) {
                    const formatted = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2,"0")}-${String(current.getDate()).padStart(2,"0")}`;
                    acc[b.villa].push(formatted);
                    current.setDate(current.getDate() + 1);
                  }
                }
                return acc;
              }, {})}
           villas={["All Villas","Sample Villa","Khetan Villa","Madan Villa","Pandhari Villa","Dormitory Villa","Tidke Villa","Ishan Villa","Cottage Villa","Krishna Villa","Motvani Villa","Bhatkar villa"]}
              bookedByDate={bookings.reduce((acc, b) => {
                if (b.checkIn && b.checkOut) {
                  const start = new Date(b.checkIn);
                  const end = new Date(b.checkOut);
                  const current = new Date(start);
                  while (current <= end) {
                    const formatted = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2,"0")}-${String(current.getDate()).padStart(2,"0")}`;
                    if (!acc[formatted]) acc[formatted] = [];
                    acc[formatted].push(b.villa);
                    current.setDate(current.getDate() + 1);
                  }
                }
                return acc;
              }, {})}
            />
          )}
        </div>
      </div>

      {/* NewBooking overlay */}
      {showNewBooking && (
        <NewBooking
          onClose={() => setShowNewBooking(false)}
          onSave={async () => { await fetchBookings(); setShowNewBooking(false); }}
        />
      )}

      {/* EditBooking overlay */}
      {showEditBooking && selectedBooking && (
        <EditBooking
          booking={selectedBooking}
          onClose={() => setShowEditBooking(false)}
          onSave={handleSaveEditedBooking}
        />
      )}

      {/* Invoice overlay */}
      {showInvoice && selectedBooking && (
        <Invoice
          booking={selectedBooking}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </div>
  );
};

export default Booking;
