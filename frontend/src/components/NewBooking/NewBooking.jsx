// src/components/NewBooking/NewBooking.jsx
import React, { useState, useEffect } from "react";
import "./NewBooking.css";

const NewBooking = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    guest: "",
    email: "",
    phone: "",
    address: "",
    aadhar: "",
    villa: "Sample Villa",
    checkIn: "",
    checkOut: "",
    nights: 0,
    guests: 1,
    status: "Pending",

    baseAmount: "",
    gstType: "",
    totalAmount: 0,
    receivedBy: "",
    paymentMode: "",
    paymentCategory: "Total",
    advancedAmount: 0,
    remainingAmount: 0,
  });

  const villaOptions = [
  "All Villas",
  "Sample Villa",
  "Khetan Villa",
  "Madan Villa",
  "Pandhari Villa",
  "Dormitory Villa",
  "Tidke Villa",
  "Ishan Villa",
  "Cottage Villa",
  "Krishna Villa",
  "Motvani Villa",
  "Bhatkar villa"
];

  const [dateError, setDateError] = useState("");

  const normalizeAadharInput = (val) => {
    let digits = String(val).replace(/\D/g, "").slice(0, 12);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    setFormData((prev) => {
      const next = {
        ...prev,
        [name]:
          type === "number"
            ? value === ""
              ? ""
              : Number(value)
            : value,
      };

      // nights auto-calc
      if (name === "checkIn" || name === "checkOut") {
        const checkIn = name === "checkIn" ? value : next.checkIn;
        const checkOut = name === "checkOut" ? value : next.checkOut;
        if (checkIn && checkOut) {
          const d1 = new Date(checkIn);
          const d2 = new Date(checkOut);
          if (!isNaN(d1) && !isNaN(d2) && d2 > d1) {
            next.nights = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
            setDateError("");
          } else {
            next.nights = 0;
            setDateError("Check-out must be after check-in");
          }
        } else {
          next.nights = 0;
          setDateError("");
        }
      }

      // paymentCategory "Total" resets advanced/remaining
      if (name === "paymentCategory" && value === "Total") {
        next.advancedAmount = 0;
        next.remainingAmount = 0;
      }

      // if advanced/amount change and paymentCategory is Advanced, recalc remaining
      if (
        (name === "advancedAmount" || name === "baseAmount") &&
        next.paymentCategory === "Advanced"
      ) {
        const advanced = Number(
          name === "advancedAmount" ? value : next.advancedAmount
        );
        const base = Number(name === "baseAmount" ? value : next.baseAmount) || 0;
        const gstRate = next.gstType ? 0.18 : 0;
        const gst = +(base * gstRate).toFixed(2);
        const total = +(base + gst).toFixed(2);
        next.remainingAmount = Math.max(total - (advanced || 0), 0);
        next.totalAmount = total;
      }

      return next;
    });
  };

  // aadhar special handler
  const handleAadharChange = (e) => {
    const formatted = normalizeAadharInput(e.target.value);
    setFormData((prev) => ({ ...prev, aadhar: formatted }));
  };

  // Recompute total when baseAmount or gstType changes
  useEffect(() => {
    const base = Number(formData.baseAmount || 0);
    if (!base || !formData.gstType) {
      setFormData((prev) => ({ ...prev, totalAmount: 0 }));
      return;
    }
    const gstRate = 0.18;
    const gstAmount = +(base * gstRate).toFixed(2);
    const total = +(base + gstAmount).toFixed(2);

    setFormData((prev) => ({
      ...prev,
      totalAmount: total,
      remainingAmount:
        prev.paymentCategory === "Advanced"
          ? Math.max(total - (prev.advancedAmount || 0), 0)
          : 0,
    }));
  }, [formData.baseAmount, formData.gstType, formData.paymentCategory, formData.advancedAmount]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.guest.trim()) return alert("Enter guest");
    if (!formData.email.trim()) return alert("Enter email");
    if (!formData.aadhar || formData.aadhar.replace(/\s/g, "").length !== 12)
      return alert("Enter 12-digit Aadhar");
    if (!formData.checkIn || !formData.checkOut) return alert("Select dates");
    if (formData.nights <= 0) return alert("Invalid dates");
    if (!formData.baseAmount || Number(formData.baseAmount) <= 0)
      return alert("Enter base amount");
    if (!formData.gstType) return alert("Select GST type");
    if (!formData.receivedBy.trim()) return alert("Enter received by");
    if (!formData.paymentMode) return alert("Select payment mode");

    const payload = {
      guest: formData.guest.trim(),
      email: formData.email.trim(),
      phone: formData.phone?.trim() || null,
      address: formData.address?.trim() || null,
      aadhar: formData.aadhar.replace(/\s/g, ""),
      villa: formData.villa,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      nights: Number(formData.nights),
      guests: Number(formData.guests),

      baseAmount: Number(formData.baseAmount),
      gstType: formData.gstType,
      advancedAmount:
        formData.paymentCategory === "Advanced"
          ? Number(formData.advancedAmount || 0)
          : 0,
      paymentCategory: formData.paymentCategory,
      paymentMode: formData.paymentMode,
      receivedBy: formData.receivedBy.trim(),
      status: formData.status,
    };

    try {
      const res = await fetch("https://shivaam-farms-and-resorts-villa.onrender.com/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json();

      if (!res.ok) {
        alert("Error: " + (body.error || "server error"));
        return;
      }

      alert("Booking created");

      // 🔥 REFRESH PARENT LIST FIRST
      await onSave(body.data);

      // 🔥 THEN CLOSE MODAL
      onClose();

    } catch (err) {
      console.error("Create booking failed", err);
      alert("Could not connect to server");
    }
  };


  return (
    <div className="new-booking-overlay" role="dialog" aria-modal="true">
      <div className="new-booking-page">
        <div className="card p-4 shadow">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5>Create New Booking</h5>
              <small className="text-muted">Fill details</small>
            </div>
            <button className="btn-close" onClick={onClose} aria-label="Close" />
          </div>

          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-12 col-sm-6">
              <label>Guest Name</label>
              <input name="guest" value={formData.guest} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-12 col-sm-6">
              <label>Villa</label>
              <select
  name="villa"
  value={formData.villa}
  onChange={handleChange}
  className="form-select"
>
  {villaOptions.map((villa, index) => (
    <option key={index} value={villa}>
      {villa}
    </option>
  ))}
</select>

            </div>

            <div className="col-12 col-sm-6">
              <label>Email</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-12 col-sm-6">
              <label>Phone</label>
              <input name="phone" value={formData.phone} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-12 col-sm-6">
              <label>Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} className="form-control" rows="2" />
            </div>

            <div className="col-12 col-sm-6">
              <label>Aadhar</label>
              <input name="aadhar" value={formData.aadhar} onChange={handleAadharChange} className="form-control" maxLength={14} />
              {formData.aadhar && formData.aadhar.replace(/\s/g, "").length !== 12 && (
                <small className="text-danger">Aadhar must be 12 digits</small>
              )}
            </div>

            <div className="col-12 col-sm-6">
              <label>Check-in</label>
              <input name="checkIn" type="date" value={formData.checkIn} onChange={handleChange} className="form-control" min={new Date().toISOString().split("T")[0]} />
            </div>

            <div className="col-12 col-sm-6">
              <label>Check-out</label>
              <input name="checkOut" type="date" value={formData.checkOut} onChange={handleChange} className="form-control" min={formData.checkIn ? new Date(new Date(formData.checkIn).getTime() + 86400000).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]} />
            </div>

            <div className="col-12 col-sm-6">
              <label>Nights</label>
              <input value={formData.nights ? `${formData.nights} nights` : ""} readOnly className="form-control" />
            </div>

            <div className="col-12 col-sm-6">
              <label>Guests</label>
              <input name="guests" type="number" min="1" value={formData.guests} onChange={handleChange} className="form-control" />
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
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" id="pcTotal" name="paymentCategory" value="Total" checked={formData.paymentCategory === "Total"} onChange={handleChange} />
                  <label className="form-check-label" htmlFor="pcTotal">Total</label>
                </div>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" id="pcAdv" name="paymentCategory" value="Advanced" checked={formData.paymentCategory === "Advanced"} onChange={handleChange} />
                  <label className="form-check-label" htmlFor="pcAdv">Advanced</label>
                </div>
              </div>
            </div>
            
<div className="col-12 col-sm-6">
  <label>Customer Payment (₹)</label>
  <input
    value={
      formData.paymentCategory === "Advanced"
        ? formData.advancedAmount
        : formData.totalAmount
    }
    readOnly
    className="form-control"
  />
</div>



            {formData.paymentCategory === "Advanced" && (
              <>
                <div className="col-12 col-sm-6">
                  <label>Advanced Amount (₹)</label>
                  <input name="advancedAmount" type="number" value={formData.advancedAmount} onChange={handleChange} className="form-control" />
                </div>

                <div className="col-12 col-sm-6">
                  <label>Remaining (₹)</label>
                  <input value={formData.remainingAmount} readOnly className="form-control" />
                </div>
              </>
            )}

            <div className="col-12 col-sm-6">
              <label>Total Amount (auto)</label>
              <input value={formData.totalAmount} readOnly className="form-control" />
            </div>

            <div className="col-12 col-sm-6">
              <label>Received By</label>
              <input name="receivedBy" value={formData.receivedBy} onChange={handleChange} className="form-control" />
            </div>

            {dateError && <div className="col-12"><small className="text-danger">{dateError}</small></div>}

            <div className="col-12 d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-success">Create Booking</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewBooking;
