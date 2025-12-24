import React, { useState, useEffect } from "react";

const InventoryTable = ({ items: propsItems }) => {
  const [items, setItems] = useState([]);

  // Update local state when propsItems change
  useEffect(() => {
    setItems(propsItems || []);
  }, [propsItems]);

  // Delete item
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const res = await fetch(`https://shivaam-farms-and-resorts-villa-kynh.onrender.com/api/stocks/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" }
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to delete");

        // Update table locally
        setItems((prev) => prev.filter((item) => item.id !== id));
        alert(data.message);
      } catch (err) {
        console.error("Delete error:", err);
        alert("Error deleting item");
      }
    }
  };

  return (
    <div style={{ marginTop: "20px", overflowX: "auto", whiteSpace: "nowrap" }}>
      <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>Stock Inventory</h3>
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: "0 8px",
          marginTop: "10px",
        }}
      >
        <thead>
          <tr style={{ background: "#f2f2f2", borderRadius: "6px" }}>
            <th style={thStyle}>Item Name</th>
            <th style={thStyle}>Villa</th>
            <th style={thStyle}>Category</th>
            <th style={thStyle}>Unit</th>
            <th style={thStyle}>Stock Type</th>
            <th style={thStyle}>Current Stock</th>
            <th style={thStyle}>Min Stock</th>
            <th style={thStyle}>Max Stock</th>
            <th style={thStyle}>New Stock Qty</th>
            <th style={thStyle}>Price</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Location</th>
            <th style={thStyle}>Payment Mode</th>
            <th style={thStyle}>Received By</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody >
          {items.length > 0 ? (
            items.map((item) => (
              <tr key={item.id}>
                <td style={{ textAlign: "center" }}>{item.itemname}</td>
                <td style={{ textAlign: "center" }}>{item.villa}</td>
                <td style={{ textAlign: "center" }}>{item.category}</td>
                <td style={{ textAlign: "center" }}>{item.unit}</td>
                <td style={{ textAlign: "center" }}>{item.stocktype ? "New" : "Regular"}</td>
                <td style={{ textAlign: "center" }}>{item.current_stock || "-"}</td>
                <td style={{ textAlign: "center" }}>{item.min_stock || "-"}</td>
                <td style={{ textAlign: "center" }}>{item.max_stock || "-"}</td>
                <td style={{ textAlign: "center" }}>{item.new_stock_qty || "-"}</td>
                <td style={{ textAlign: "center" }}>{item.price || "-"}</td>
                <td style={{ textAlign: "center" }}>{item.date}</td>
                <td style={{ textAlign: "center" }}>{item.location}</td>
                <td style={{ textAlign: "center" }}>{item.payment_mode}</td>
                <td style={{ textAlign: "center" }}>{item.received_by}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                    }}

                    onClick={(e) => {
                      e.preventDefault(); // 👈 important
                      handleDelete(item.id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={tdStyle} colSpan="15">
                No items found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Styles
const thStyle = {
  borderBottom: "2px solid #dee2e6",
  padding: "10px 20px", // 👈 adds space between columns
  textAlign: "left",
  fontWeight: "bold",
  whiteSpace: "nowrap",
};

const tdStyle = {
  borderBottom: "1px solid #eee",
  padding: "8px 20px", // 👈 adds column spacing
  whiteSpace: "nowrap",
  fontSize: "0.95rem"
};

export default InventoryTable;