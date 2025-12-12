import React, { useState } from "react";
import { supabase } from "../../supabaseClient";

const villaCategories = {
  "Sample Villa": { dimensions: "1 BHK", maxGuests: 15 },
  "Khetan Villa": { dimensions: "3 BHK", maxGuests: 15 },
  "Madan Villa": { dimensions: "2 BHK", maxGuests: 15 },
  "Pandhari Villa": { dimensions: "2 BHK", maxGuests: 15 },
  "Dormitory Villa": { dimensions: "5 BHK", maxGuests: 15 },
  "Tidke Villa": { dimensions: "2 BHK", maxGuests: 15 },
  "Ishan Villa": { dimensions: "3 BHK", maxGuests: 15 },
  "Cottage Villa": { dimensions: "4 BHK", maxGuests: 15 },
  "Krishna Villa": { dimensions: "3 BHK", maxGuests: 15 },
  "Motvani Villa": { dimensions: "5 BHK", maxGuests: 15 },
  "Bhatkar Villa": { dimensions: "5 BHK", maxGuests: 15 },
};

const villas = Object.keys(villaCategories);

const CheckAvailability = () => {
  const [selectedVilla, setSelectedVilla] = useState(villas[0]);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleVillaChange = (villa) => {
    setSelectedVilla(villa);
    setGuests((prev) => Math.min(prev, villaCategories[villa].maxGuests));
  };

  const handleCheckAvailability = async () => {
    if (!checkIn || !checkOut) {
      setWarningMessage("Please select villa and both check-in and check-out dates.");
      setIsWarningOpen(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("check_in, check_out, status")
        .eq("villa", selectedVilla)
        .not("status", "eq", "Cancelled");

      if (error) throw error;

      const newStart = new Date(checkIn);
      const newEnd = new Date(checkOut);

      const conflicting = data?.find((booking) => {
        const existingStart = new Date(booking.check_in);
        const existingEnd = new Date(booking.check_out);
        return newStart <= existingEnd && newEnd >= existingStart;
      });

      if (conflicting) {
        const start = conflicting.check_in;
        const end = new Date(conflicting.check_out);
        const formattedEnd = end.toISOString().split("T")[0];

        if (checkOut === formattedEnd) {
          setWarningMessage(`${selectedVilla} will be open from 1 PM on ${formattedEnd}.`);
        } else {
          end.setDate(end.getDate() - 1);
          setWarningMessage(
            `${selectedVilla} is booked from ${start} to ${end.toISOString().split("T")[0]}.`
          );
        }

        setIsWarningOpen(true);
        return;
      }

      setIsPopupOpen(true);
    } catch (err) {
      console.error(err);
      setWarningMessage("Failed to check availability. Try again.");
      setIsWarningOpen(true);
    }
  };

  return (
    <div className="bg-white rounded-xl p-3 border">
      <div className="container mx-auto max-w-[980px]">

        {/* Form Layout */}
        <div className="flex flex-wrap items-end gap-3 p-3">

          {/* Select Villa */}
          <div className="flex flex-col w-full sm:w-auto min-w-[160px]">
            <label className="text-sm font-semibold mb-1">Select Villa</label>
            <select
              value={selectedVilla}
              onChange={(e) => handleVillaChange(e.target.value)}
              className="border px-3 py-2 rounded-lg w-full"
            >
              {villas.map((villa) => (
                <option key={villa} value={villa}>
                  {villa}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="flex flex-col w-full sm:w-auto min-w-[140px]">
            <label className="text-sm font-semibold mb-1">Category</label>
            <input
              type="text"
              readOnly
              value={villaCategories[selectedVilla]?.dimensions}
              className="border px-3 py-2 rounded-lg bg-gray-100 w-full"
            />
          </div>

          {/* Check-in */}
          <div className="flex flex-col w-full sm:w-auto min-w-[140px]">
            <label className="text-sm font-semibold mb-1">Check-in</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={today}
              className="border px-3 py-2 rounded-lg w-full"
            />
          </div>

          {/* Check-out */}
          <div className="flex flex-col w-full sm:w-auto min-w-[140px]">
            <label className="text-sm font-semibold mb-1">Check-out</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || today}
              className="border px-3 py-2 rounded-lg w-full"
            />
          </div>

          {/* Guests */}
          <div className="flex flex-col w-full sm:w-auto min-w-[120px]">
            <label className="text-sm font-semibold mb-1">Guests</label>
            <div className="flex items-center justify-between border px-3 py-2 rounded-lg w-full">
              <button
                onClick={() => setGuests((prev) => Math.max(1, prev - 1))}
                className="text-lg font-bold"
              >
                −
              </button>
              <span className="text-lg">{guests}</span>
              <button
                onClick={() =>
                  setGuests((prev) =>
                    Math.min(prev + 1, villaCategories[selectedVilla].maxGuests)
                  )
                }
                className="text-lg font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* ALWAYS CENTERED BUTTON */}
          <div className="w-full flex justify-center mt-2">
            <button
              onClick={handleCheckAvailability}
              className="bg-[#1F4529] text-white px-6 py-2 rounded-lg text-lg font-semibold"
            >
              Check Availability
            </button>
          </div>
        </div>
      </div>

      {/* Popup - Available */}
      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-[9999]">
          <div className="bg-white rounded-xl p-6 text-center w-[90%] max-w-md border">
            <h2 className="text-lg font-semibold mb-4">✅ Villa Available</h2>
            <p>
              {selectedVilla} is available from <b>{checkIn}</b> to <b>{checkOut}</b>.
            </p>
            <button
              onClick={() => setIsPopupOpen(false)}
              className="mt-6 bg-[#1F4529] text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Popup - Warning */}
      {isWarningOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-[9999]">
          <div className="bg-white p-6 rounded-xl border text-center w-[350px]">
            <h2 className="text-lg font-semibold text-red-600 mb-3">⚠️ Warning</h2>
            <p className="mb-4">{warningMessage}</p>
            <button
              onClick={() => setIsWarningOpen(false)}
              className="bg-[#1F4529] text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckAvailability;
