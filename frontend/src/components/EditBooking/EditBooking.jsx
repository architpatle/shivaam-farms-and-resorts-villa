// src/components/EditBooking/EditBooking.jsx
import React, { useState, useEffect } from "react";
import "./EditBooking.css";

const EditBooking = ({ booking, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: null,
    guest: "",
    // email: "",
    phone: "",
    address: "",
    // aadhar: "",
    villa: "",
    checkIn: "",
    checkOut: "",
    nights: 0,
    guests: 1,
    status: "Pending",

    baseAmount: 0,
    gstType: "",
    totalAmount: 0,
    receivedBy: "",
    paymentMode: "",
    paymentCategory: "Total",
    advancedAmount: 0,
    remainingAmount: 0,
  });

  useEffect(() => {
    if (!booking) return;
    // booking from API is snake_case from DB - map to camelCase for form
    setFormData({
      id: booking.id,
      guest: booking.guest ?? "",
      // email: booking.email ?? "",
      phone: booking.phone ?? "",
      address: booking.address ?? "",
      // aadhar: booking.aadhar ? booking.aadhar.replace(/\s/g, "") : "",
      villa: booking.villa ?? "",
      checkIn: booking.checkIn ?? "",
      checkOut: booking.checkOut ?? "",
      nights: booking.nights ?? 0,
      guests: booking.guests ?? 1,
      status: booking.status ?? "Pending",

      baseAmount: Number(booking.base_amount || 0),
      gstType: booking.gst_type || "",
      totalAmount: Number(booking.total_amount || 0),
      receivedBy: booking.received_by || "",
      paymentMode: booking.payment_mode || "",
      paymentCategory: booking.payment_category || "Total",
      advancedAmount: Number(booking.advanced_amount || 0),
      remainingAmount: Number(booking.remaining_amount || 0),
    });
  }, [booking]);

  useEffect(() => {
    // recalc total when baseAmount or gstType changes
    const base = Number(formData.baseAmount || 0);
    if (!base || !formData.gstType) {
      setFormData((p) => ({ ...p, totalAmount: 0 }));
      return;
    }
    const gstRate = 0.18;
    const gst = +(base * gstRate).toFixed(2);
    const total = +(base + gst).toFixed(2);

    setFormData((p) => ({
      ...p,
      totalAmount: total,
      remainingAmount:
        p.paymentCategory === "Advanced" ? Math.max(total - (p.advancedAmount || 0), 0) : 0,
    }));
  }, [formData.baseAmount, formData.gstType, formData.paymentCategory, formData.advancedAmount]);

  // const handleAadhar = (val) => {
  //   let digits = String(val).replace(/\D/g, "").slice(0, 12);
  //   const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  //   setFormData((p) => ({ ...p, aadhar: formatted }));
  // };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // prepare normalized payload (camelCase)
    const payload = {
      id: formData.id,
      guest: formData.guest,
      // email: formData.email,
      phone: formData.phone || null,
      address: formData.address || null,
      // aadhar: formData.aadhar.replace(/\s/g, ""),
      villa: formData.villa,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      nights: Number(formData.nights || 0),
      guests: Number(formData.guests || 1),

      baseAmount: Number(formData.baseAmount || 0),
      gstType: formData.gstType,
      advancedAmount: formData.paymentCategory === "Total"
        ? booking.advanced_amount   // ← keep original
        : Number(formData.advancedAmount || 0),
      paymentCategory: formData.paymentCategory,
      paymentMode: formData.paymentMode,
      receivedBy: formData.receivedBy,
      status: formData.status,
    };

    try {
      const res = await fetch(`https://shivaam-farms-and-resorts-villa.onrender.com/api/bookings/${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) {
        alert("Update error: " + (body.error || "server error"));
        return;
      }
      alert("Booking updated");
      onSave(body.data);
      onClose();
    } catch (err) {
      console.error("Update failed", err);
      alert("Could not update booking");
    }
  };

  return (
    <div className="new-booking-overlay">
      <div className="new-booking-page">
        <div className="card p-4 shadow">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Edit Booking</h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-12 col-sm-6">
              <label>Guest</label>
              <input name="guest" value={formData.guest} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-12 col-sm-6">
              <label>Villa</label>
              <input name="villa" value={formData.villa} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-12 col-sm-6">
              <label>Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} className="form-control" rows="2" />
            </div>

            {/* <div className="col-12 col-sm-6">
              <label>Aadhar</label>
              <input name="aadhar" value={formData.aadhar} onChange={(e) => handleAadhar(e.target.value)} className="form-control" maxLength={14} />
            </div> */}

            <div className="col-12 col-sm-6">
              <label>Check-in</label>
              <input name="checkIn" type="date" value={formData.checkIn} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-12 col-sm-6">
              <label>Check-out</label>
              <input name="checkOut" type="date" value={formData.checkOut} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-12 col-sm-6">
              <label>Base Amount (₹)</label>
              <input name="baseAmount" type="number" value={formData.baseAmount} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-12 col-sm-6">
              <label>GST Type</label>
              <select name="gstType" value={formData.gstType} onChange={handleChange} className="form-select">
                <option value="">Select</option>
                <option value="CGST + SGST (9% + 9%)">CGST + SGST (9% + 9%)</option>
                <option value="IGST (18%)">IGST (18%)</option>
              </select>
            </div>

            <div className="col-12 col-sm-6">
              <label>Payment Mode</label>
              <select name="paymentMode" value={formData.paymentMode} onChange={handleChange} className="form-select">
                <option value="">Select</option>
                <option value="Cash">Cash</option>
                <option value="Online">Online</option>
              </select>
            </div>

            <div className="col-12 col-sm-6">
              <label>Payment Category</label>
              <div>
                <input type="radio" id="total" name="paymentCategory" value="Total" checked={formData.paymentCategory === "Total"} onChange={handleChange} /> <label htmlFor="total">Total</label>
                <input type="radio" id="adv" name="paymentCategory" value="Advanced" checked={formData.paymentCategory === "Advanced"} onChange={handleChange} style={{ marginLeft: 10 }} /> <label htmlFor="adv">Advanced</label>
              </div>
            </div>

            {formData.paymentCategory === "Advanced" && (
              <>
                <div className="col-12 col-sm-6">
                  <label>Advanced</label>
                  <input name="advancedAmount" type="number" value={formData.advancedAmount} onChange={handleChange} className="form-control" />
                </div>

                <div className="col-12 col-sm-6">
                  <label>Remaining</label>
                  <input value={formData.remainingAmount} readOnly className="form-control" />
                </div>
              </>
            )}

            <div className="col-12 col-sm-6">
              <label>Total (auto)</label>
              <input value={formData.totalAmount} readOnly className="form-control" />
            </div>

            <div className="col-12 d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBooking;
