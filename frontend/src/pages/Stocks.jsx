import React, { useState, useEffect } from "react";
import Card from "../components/Card/Card";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import InventoryTable from "../components/InventoryTable/InventoryTable";

const Stocks = () => {

  const [items, setItems] = useState([]);

  const [selectedVilla, setSelectedVilla] = useState("All Villas");

  // Filter items based on selected villa
  const allItemsFiltered = items.filter(item =>
    selectedVilla === "All Villas" || item.villa?.toLowerCase() === selectedVilla.toLowerCase()
  );
  const fetchStocks = async () => {
    try {
      const res = await fetch("https://shivaam-farms-and-resorts-villa.onrender.com/api/stocks");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Error fetching stocks:", err);
    }
  };

  // Page load par fetch
  useEffect(() => {
    fetchStocks();
  }, []);


  const [formData, setFormData] = useState({
    itemname: "",
    villa: "",
    category: "",
    unit: "",
    stockType: false,
    currentStock: "",
    minStock: "",
    maxStock: "",
    newStockQty: "",
    price: "",
    date: "",
    location: "",
    paymentMode: "",
    receivedBy: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };






  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://shivaam-farms-and-resorts-villa.onrender.com/api/stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemname: formData.itemname,
          villa: formData.villa,
          category: formData.category,
          unit: formData.unit,
          stocktype: formData.stockType,
          current_stock: formData.currentStock || null,
          min_stock: formData.minStock || null,
          max_stock: formData.maxStock || null,
          new_stock_qty: formData.newStockQty || null,
          price: formData.price || null,
          date: formData.date,
          location: formData.location,
          payment_mode: formData.paymentMode,
          received_by: formData.receivedBy,
        }),
      });
      const data = await res.json();
      console.log("Stock added:", data);
      setFormData({ itemName: "", villa: "", category: "", unit: "", isNewStock: false, currentStock: "", minStock: "", maxStock: "", newStockQty: "", date: "", location: "", paymentMode: "", receivedBy: "" });
      fetchStocks(); // refresh table
      setShowModal(false);
    } catch (err) { console.error(err); }
  };

  // const [showLowStockModal, setShowLowStockModal] = useState(false);

  // const [lowStockItems, setLowStockItems] = useState([]);

  const [showModal, setShowModal] = useState(false);

  const [activeCategory, setActiveCategory] = useState("All items");

  const categories = [
    {
      id: "All items",
      label: "All Items",
      content: (
        <div>
          {/* Villa Dropdown */}
          <div className="dropdown mb-3"  >
            <button
              style={{ marginBottom: "20px" }}
              className="btn btn-secondary dropdown-toggle"
              type="button"
              id="villasDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {selectedVilla} {/* Show selected villa */}
            </button>
            <ul className="dropdown-menu" aria-labelledby="villasDropdown">
              {["All Villas", "Sample Villa", "Khetan Villa", "Madan Villa", "Pandhari Villa", "Dormitory Villa", "Tidke Villa", "Ishan Villa", "Cottage Villa", "Krishna Villa", "Motvani villa", "Bhatkar villa"].map(villa => (
                <li key={villa}>
                  <a
                    className="dropdown-item"
                    href="#"
                    onClick={() => setSelectedVilla(villa)}
                  >
                    {villa}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Inventory Table */}
          <InventoryTable items={allItemsFiltered} />
        </div>
      ),
    },
    {
      id: "furniture",
      label: "Furniture",
      content: (
        <InventoryTable
          items={items.filter(
            (item) => item.category?.toLowerCase() === "furniture"
          )}
        />
      )
    },
    {
      id: "groceries",
      label: "Groceries",
      content: (
        <InventoryTable
          items={items.filter(
            (item) => item.category?.toLowerCase() === "groceries"
          )}
        />
      )
    },
    {
      id: "maintenance",
      label: "Maintenance",
      content: (
        <InventoryTable
          items={items.filter(
            (item) => item.category?.toLowerCase() === "maintenance"
          )}
        />
      )
    },
    {
      id: "amenities",
      label: "Amenities",
      content: (
        <InventoryTable
          items={items.filter(
            (item) => item.category?.toLowerCase() === "amenities"
          )}
        />
      )
    },
    {
      id: "others",
      label: "Others",
      content: (
        <InventoryTable
          items={items.filter(
            (item) => item.category?.toLowerCase() === "others"
          )}
        />
      )
    }
  ];

  // //  Filter Low Stocks
  // const handleLowStockClick = () => {
  //   const filtered = items.filter(
  //     (item) => Number(item.current_stock) <= Number(item.min_stock)
  //   );

  //   console.log("Low Stock Items:", filtered); // Debug
  //   setLowStockItems(filtered);
  //   setShowLowStockModal(true);
  // };


  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  };

  const modalStyle = {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "500px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
  };

  const inputStyle = {
    width: "100%",
    padding: "5px",
    marginTop: "2px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  };



  const totalExpenses = items.reduce((acc, item) => acc + (Number(item.price) || 0), 0);


  return (

    <div className="overviewContainer container">


      <div className="d-flex justify-content-between align-items-center">
        <div className="mt-2">
          <h4 className="fw-bold mb-0">Stock Management</h4>
          <p className="text-muted mb-4">
            Track villa supplies and inventory levels
          </p></div>
        <button
          className="bg-green-600 text-white px-3 py-2 rounded"
          onClick={() => setShowModal(true)}
        >
          + Add Item
        </button>
      </div>

      {/* card section */}

      <div className="row g-3  ">
        <Card
          cardTitle={"Total Villas"}
          cardSubtitle={"10"}

        />

        {/* <Card
          cardTitle="Low Stock Alerts"
          cardSubtitle={`${items.filter(
            (item) => Number(item.current_stock) <= Number(item.min_stock)
          ).length
            } items`}
          onClick={handleLowStockClick}
          style={{ cursor: "pointer" }}
        /> */}


        <Card
          cardTitle={"Expenses"}
          cardSubtitle={`Rs.${totalExpenses.toLocaleString()}`}

        />
        {/* <Card
          cardTitle={"Category"}
          cardSubtitle={"5"}

        /> */}
      </div>



      {/* --- Low Stock Modal --- */}
      {/* {showLowStockModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Low Stock Items</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setShowLowStockModal(false)}
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='black'%3E%3Cpath d='M.293 1.293a1 1 0 0 1 1.414 0L8 7.586l6.293-6.293a1 1 0 1 1 1.414 1.414L9.414 9l6.293 6.293a1 1 0 0 1-1.414 1.414L8 10.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L6.586 9 .293 2.707a1 1 0 0 1 0-1.414z'/%3E%3C/svg%3E\")",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "1em",
                    width: "1em",
                    height: "1em",
                    border: "none",
                  }}
                ></button>

              </div>

              <div className="modal-body">
                <div className="border rounded p-3 bg-light mt-2">
                  <h5 className="text-danger fw-semibold mb-1">
                    Low Stock Alerts
                  </h5>
                  <p className="text-muted mb-3">
                    Items that need immediate attention
                  </p>

                  {lowStockItems.length > 0 ? (
                    lowStockItems.map((item) => (
                      <div
                        key={item.id}
                        className="d-flex justify-content-between align-items-center bg-white border rounded p-3 mb-2 shadow-sm"
                      >
                        <div>
                          <div className="fw-semibold">{item.itemname}</div>
                          <small className="text-muted">
                            {item.current_stock} remaining (min: {item.min_stock})
                          </small>
                        </div>

                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No low stock items found.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )} */}



      {/* category*/}

      <div className="container my-4">

        <div className="d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-3">Categories</h5>
        </div>


        {/* Row of category buttons */}
        <div className="d-flex flex-wrap gap-2 mb-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className="btn p-1"
              style={{
                lineHeight: 1,
                display: "inline-block",
                backgroundColor: activeCategory === cat.id ? "#706b6bff" : "#F8F8F8", // active black, others light gray
                color: activeCategory === cat.id ? "#fff" : "#000",
                border: "1px solid #8b8080ff",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Display content of active category */}

        <div>

          <div className="p-3 border rounded">
            {categories.find((cat) => cat.id === activeCategory)?.content}
          </div>
        </div>

      </div>




      {/* Modal  add item table*/}
      {showModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3 style={{ fontSize: "20px", fontWeight: "bold" }}>
              Add New Stock Item
            </h3>
            <p>Enter the details for the new inventory item.</p>


            <form onSubmit={handleSubmit}>
              <div>
                <label>Item Name</label>
                <input type="text" placeholder="Enter item name" name="itemname" value={formData.itemName} onChange={handleChange} style={inputStyle} />
              </div>

              <div style={{ marginTop: "8px" }}>
                <label>Villa</label>
                <select name="villa" value={formData.villa} onChange={handleChange} style={inputStyle}>
                  <option>Select Villa</option>
                  <option>Sample Villa</option>
                  <option>Khetan Villa</option>
                  <option>Madan Villa</option>
                  <option>Pandhari Villa</option>
                  <option>Dormitory Villa</option>
                  <option>Tidke Villa</option>
                  <option>Ishan Villa</option>
                  <option>Cottage Villa</option>
                  <option>Krishna Villa</option>
                  <option>Motvani Villa</option>
                  <option>Bhatkar Villa</option>

                </select>
              </div>

              <div style={{ marginTop: "8px" }}>
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange} style={inputStyle}>
                  <option>Select category</option>
                  <option>Furniture</option>
                  <option>Groceries</option>
                  <option>Maintenance</option>
                  <option>Amenities</option>
                  <option>Others</option>
                </select>
              </div>

              <div style={{ marginTop: "8px" }}>
                <label>Unit</label>
                <input
                  type="text"
                  placeholder="e.g., pieces, bottles, sets"
                  name="unit" value={formData.unit} onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* Radio buttons for current/new stock */}
              <div style={{ marginTop: "12px", display: "flex", gap: "20px" }}>
                <label>
                  <input
                    type="radio"
                    name="stockType"
                    value="false"
                    checked={formData.stockType === false} // Ensure correct property name
                    onChange={(e) => setFormData({
                      ...formData,
                      stockType: e.target.value === "true" // Convert string to boolean
                    })}
                  />
                  Regular Stock
                </label>

                <label>
                  <input
                    type="radio"
                    name="stockType"
                    value="true"
                    checked={formData.stockType === true}
                    onChange={(e) => setFormData({
                      ...formData,
                      stockType: e.target.value === "true"
                    })}
                  />
                  New Stock
                </label>
              </div>

              {/* Stock Inputs */}
              {formData.stockType === false ? (
                // Current stock inputs
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "8px",
                    marginTop: "8px",
                  }}
                >
                  <div>
                    <label>Current Stock</label>
                    <input
                      type="number"
                      name="currentStock"
                      value={formData.currentStock}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label>Min Stock</label>
                    <input
                      type="number"
                      name="minStock"
                      value={formData.minStock}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label>Max Stock</label>
                    <input
                      type="number"
                      name="maxStock"
                      value={formData.maxStock}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>
                </div>
              ) : (
                // New stock input
                <div style={{ marginTop: "8px" }}>
                  <label>New Stock Quantity</label>
                  <input
                    type="number"
                    name="newStockQty"
                    value={formData.newStockQty}
                    onChange={handleChange}
                    placeholder="Enter new stock quantity"
                    style={inputStyle}
                  />
                </div>
              )}


              <div>
                <label>Price</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Enter price" style={inputStyle} />
              </div>



              <div style={{ marginTop: "8px" }}>
                <label>Date</label>
                <input
                  type="date"
                  name="date" value={formData.date} onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginTop: "8px" }}>
                <label>Location</label>
                <input
                  type="text"
                  name="location" value={formData.location} onChange={handleChange}
                  placeholder="Enter storage location"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginTop: "8px" }}>
                <label>Payment Mode</label>
                <select name="paymentMode" value={formData.paymentMode} onChange={handleChange} style={inputStyle}>
                  <option>Select payment mode</option>
                  <option>Cash</option>
                  <option>Online</option>
                </select>
              </div>

              <div style={{ marginTop: "8px" }}>
                <label>Received By</label>
                <input
                  type="text"
                  placeholder="Enter staff member name"
                  name="receivedBy" value={formData.receivedBy} onChange={handleChange}
                  style={inputStyle}
                />
              </div>


              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                  marginTop: "15px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "6px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    background: "#fff",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "6px 12px",
                    borderRadius: "4px",
                    background: "green",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}






    </div>
  )
}

export default Stocks