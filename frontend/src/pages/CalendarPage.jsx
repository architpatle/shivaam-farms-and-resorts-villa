import React, { useEffect, useState } from "react";
import Calendar from "../components/Calendar/Calendar";

const CalendarPage = () => {
  const [bookedDatesByVilla, setBookedDatesByVilla] = useState({});

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(
          "https://shivaam-farms-and-resorts-villa.onrender.com/api/bookings"
        );

        const { data } = await res.json();
        const villaData = {};

        data.forEach((booking) => {
          const villa = booking.villa;
          const checkIn = booking?.check_in;
          const checkOut = booking?.check_out;

          if (!villaData[villa]) villaData[villa] = [];

          let current = new Date(checkIn);
          let end = new Date(checkOut);

          // ✅ DO NOT include checkout date in booked dates
          while (current < end) {
            const formatted = current.toISOString().split("T")[0];
            villaData[villa].push(formatted);
            current.setDate(current.getDate() + 1);
          }
        });

        setBookedDatesByVilla(villaData);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div>
      <h2 className="mb-3">Villa Calendar</h2>
      <Calendar bookedDatesByVilla={bookedDatesByVilla} onDateSelect={() => {}} />
    </div>
  );
};

export default CalendarPage;
