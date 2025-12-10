import React, { useEffect, useState } from "react";
import axios from "axios";
import "./BookingSearchPopup.css";

// Base color palette
const baseColors = [
   "#009494", // complement of #FF6B6B
    "#B1323B", // complement of #4ECDC4
    "#0026C2", // complement of #FFD93D
    "#E22E5E", // complement of #1DD1A1
    "#A0D832", // complement of #5F27CD
    "#B72404", // complement of #48DBFB
    "#0C97E1", // complement of #F368E0
    "#EF537B", // complement of #10AC84
    "#0060BC", // complement of #FF9F43
    "#C4E068", // complement of #341F97
    "#d927dfff", // complement of #341F97

];

// Generate a color for any villa number
const getVillaColor = (villa) => {
  if (!villa) return "#999"; // fallback color
  const num = parseInt(villa.toString().replace(/\D/g, "")) - 1;
  // Cycle through baseColors if villa number > palette length
  return baseColors[num % baseColors.length];
};

const BookingSearchPopup = ({ onClose, onSelect }) => {
  const [bookings, setBookings] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await axios.get("https://shivaam-farms-and-resorts-villa.onrender.com/api/bookings?checked_in=false");
        const data = res.data.data || [];
        setBookings(data);

      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Failed to load bookings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filtered = bookings.filter(
    (b) =>
      b.guest?.toLowerCase().includes(query.toLowerCase()) ||
      // b.email?.toLowerCase().includes(query.toLowerCase()) ||
      b.villa?.toLowerCase().includes(query.toLowerCase()) ||
      b.phone?.toLowerCase().includes(query.toLowerCase())
  );

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${d.getFullYear()}`;
  };

  return (
    <div
      className="booking-search-overlay"
      onClick={() => {
        setQuery("");      // ✅ clear search input
        setBookings([]);   // ✅ clear previous booking list
        onClose();         // ✅ close popup
      }}
    >

      <div
        className="booking-search-box"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">Search Bookings</h5>
          <button
            className="btn-close"
            onClick={() => {
              setQuery("");
              setBookings([]);
              onClose();
            }}
          ></button>

        </div>

        <input
          type="text"
          className="form-control mb-3"
          placeholder="Search by guest, villa, or phone..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />

        {loading ? (
          <p className="text-center mt-3">Loading bookings...</p>
        ) : error ? (
          <p className="text-center text-danger mt-3">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted text-center mt-3">No bookings found.</p>
        ) : (
          <div className="results-list">
            {filtered.map((b) => (
              <div
                key={b.id}
                className="result-item shadow-sm p-3 rounded mb-2 bg-white cursor-pointer"
                onClick={() => {
                  onSelect && onSelect(b);
                  onClose();
                }}
              >
                <div className="d-flex align-items-center mb-1">
                  {/* Colored Dot */}
                  <span
                    className="villa-dot me-2"
                    style={{ backgroundColor: getVillaColor(b.villa) }}
                  ></span>
                  <div className="fw-bold fs-6">
                    {b.guest} — {b.villa}
                  </div>
                </div>

                <div className="small text-muted mb-1">
                  {formatDate(b.check_in || b.checkIn)} →{" "}
                  {formatDate(b.check_out || b.checkOut)}
                </div>
                <div className="small mb-1">
                      {b.phone} |  Guests: {b.guests || 1}
                </div>

                <div className="small mb-1"> Payment: {b.payment_mode || "-"}</div>
                <div className="small mb-1"> Advance: ₹{b.advanced_amount || 0}</div>
                <div className="small mb-1"> Balance: ₹{b.remaining_amount || 0}</div>
                <div className="fw-bold">Total: ₹{b.total_amount || 0}</div>

                {b.status && (
                  <div className="badge bg-secondary mt-2">{b.status}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingSearchPopup;
