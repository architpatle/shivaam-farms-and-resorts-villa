import React, { useState } from "react";
import "./Calendar.css";

const Calendar = ({
  initialDate = new Date(),
  onDateSelect = () => { },
  bookedDatesByVilla = {},
 villas = [
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
    "Bhatkar villa",
  ],
  
}) => {

  const [date, setDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedVilla, setSelectedVilla] = useState("All Villas");
  const [activeDate, setActiveDate] = useState(null);
  // ✅ Close popup when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setActiveDate(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);



  // ✅ Generate villa colors (each villa has a unique color)
  // ✅ Generate up to 10 distinct colors for villas
  const villaColors = {};
  const colorPalette = [
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
  ]
  villas.forEach((villa, i) => {
    villaColors[villa] = colorPalette[i % colorPalette.length];
  });


  const year = date.getFullYear();
  const month = date.getMonth();

  // ✅ Month list (current month first)
  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("default", { month: "long" })
  );
  const currentMonth = new Date().getMonth();
  const sortedMonths = [
    ...months.slice(currentMonth),
    ...months.slice(0, currentMonth),
  ];

  // ✅ Only show current and future years
  const currentYear = new Date().getFullYear();
  const [years, setYears] = useState(
    Array.from({ length: 10 }, (_, i) => currentYear + i)
  );

  // ✅ Handle infinite year dropdown scroll
  const handleYearScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom) {
      setYears((prev) => [
        ...prev,
        ...Array.from({ length: 10 }, (_, i) => prev[prev.length - 1] + i + 1),
      ]);
    }
  };

  // ✅ Filter booked dates by selected villa
  const mergedBookedDates =
    selectedVilla === "All Villas"
      ? Object.values(bookedDatesByVilla).flat()
      : bookedDatesByVilla[selectedVilla] || [];

  // Handlers
  const handleMonthChange = (e) => {
    setDate(new Date(year, Number(e.target.value), 1));
  };

  const handleYearChange = (e) => {
    setDate(new Date(Number(e.target.value), month, 1));
  };

  const handlePrev = () => setDate(new Date(year, month - 1, 1));
  const handleNext = () => setDate(new Date(year, month + 1, 1));

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getStartDay = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getStartDay(year, month);

  const daysArray = [];
  for (let i = 0; i < startDay; i++) daysArray.push(null);
  for (let d = 1; d <= daysInMonth; d++) daysArray.push(d);
  while (daysArray.length % 7 !== 0) daysArray.push(null);

  const weekChunks = [];
  for (let i = 0; i < daysArray.length; i += 7) {
    weekChunks.push(daysArray.slice(i, i + 7));
  }

  const formatDate = (day) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const handleDateClick = (day) => {
    const fullDate = formatDate(day);

    // Toggle popup open/close
    setActiveDate((prev) => (prev === fullDate ? null : fullDate));

    // Call external date select if needed
    const isBooked = mergedBookedDates.includes(fullDate);
    if (!isBooked) {
      setSelectedDate(fullDate);
      onDateSelect(fullDate, selectedVilla);
    }
  };


  return (
    <div className="calendar-section my-4">
      {/* Controls */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-sm btn-outline-secondary" onClick={handlePrev}>
          ←
        </button>

        <div className="d-flex align-items-center gap-2">
          {/* ✅ Month dropdown with current month on top */}
          <select
            className="form-select"
            style={{ minWidth: "150px" }}
            value={month}
            onChange={handleMonthChange}
          >
            {sortedMonths.map((m, idx) => (
              <option
                key={m}
                value={(currentMonth + idx) % 12} // Map back to real month index
              >
                {m}
              </option>
            ))}
          </select>

          {/* ✅ Year dropdown (only future, infinite scroll) */}
          <select
            className="form-select"
            style={{ minWidth: "100px", maxHeight: "120px", overflowY: "auto" }}
            value={year}
            onChange={handleYearChange}
            onScroll={handleYearScroll}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* ✅ Villa dropdown (linked to color + calendar filter) */}
          <select
            className="form-select"
            style={{ minWidth: "200px" }}
            value={selectedVilla}
            onChange={(e) => setSelectedVilla(e.target.value)}
          >
            {villas.map((villa) => (
              <option key={villa} value={villa}>
                {villa}
              </option>
            ))}
          </select>
        </div>

        <button className="btn btn-sm btn-outline-secondary" onClick={handleNext}>
          →
        </button>
      </div>

      {/* Day Labels */}
      <div className="row text-center fw-semibold border-bottom pb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="col">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      {weekChunks.map((week, i) => (
        <div key={i} className="row text-center mt-2">
          {week.map((day, j) => {
            const fullDate = day ? formatDate(day) : null;
            // const isBooked = fullDate && mergedBookedDates.includes(fullDate);
            const isSelected = fullDate && fullDate === selectedDate;

            // ✅ Filter dots based on selected villa
            const bookedVillas =
              selectedVilla === "All Villas"
                ? Object.keys(bookedDatesByVilla).filter((villa) =>
                  bookedDatesByVilla[villa]?.includes(fullDate)
                )
                : bookedDatesByVilla[selectedVilla]?.includes(fullDate)
                  ? [selectedVilla] // show dot only for that villa
                  : [];

            let classNames =
              "col border calendar-day rounded p-2 d-flex flex-column align-items-center justify-content-start";
            if (isSelected) classNames += "";
            else classNames += " bg-white";

            return (
              <div
                key={j}
                className={`${classNames} calendar-day`}
                style={{
                  minHeight: "70px",
                  cursor: day ? "pointer" : "default",
                  position: "relative",
                  transition: "all 0.3s ease",
                }}
                onClick={(e) => {
                  e.stopPropagation(); // prevents closing immediately
                  day && handleDateClick(day);
                }}

              >
                {/* Date number */}
                <div className="fw-semibold">{day || ""}</div>

                {/* Dots */}
                {bookedVillas.length > 0 && (
                  <div
                    className="villa-dots"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "4px",
                      flexWrap: "wrap",
                      marginTop: "auto",
                      paddingBottom: "5px",
                    }}
                  >
                    {bookedVillas.map((villa) => (
                      <span
                        key={villa}
                        className="villa-dot"
                        style={{ backgroundColor: villaColors[villa] }}
                      ></span>
                    ))}
                  </div>
                )}

                {/* ✅ Floating Popup for clicked date */}
                {activeDate === fullDate && bookedVillas.length > 0 && (
                  <div className="villa-popup">
                    <div className="popup-header">{fullDate}</div>
                    <div className="popup-villas">
                      {bookedVillas.map((villa) => (
                        <div key={villa} className="popup-villa-item">
                          <span
                            className="popup-dot"
                            style={{ backgroundColor: villaColors[villa] }}
                          ></span>
                          <span
                            className="popup-villa-name"
                            style={{ color: villaColors[villa] }}
                          >
                            {villa}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            );
          })}

        </div>
      ))}

      {/* ✅ Legend + Selected Villa Info */}
      <div className="text-center mt-3">
        <small className="text-muted">
          Showing availability for: <strong>{selectedVilla}</strong>
        </small>

        <div className="d-flex justify-content-center gap-3 mt-2 flex-wrap">
          {villas.map(
            (villa) =>
              villa !== "All Villas" && (
                <div key={villa} className="d-flex align-items-center gap-1">
                  <div
                    style={{
                      width: "15px",
                      height: "15px",
                      backgroundColor: villaColors[villa],
                      borderRadius: "3px",
                    }}
                  ></div>
                  <small>{villa}</small>
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
