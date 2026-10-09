"use client";

import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function CrackerShop({ crackers }) {
  const [cart, setCart] = useState({});
  const [sortType, setSortType] = useState("name"); // default sort by name

  const addToCart = (crackerId) => {
    setCart((prev) => ({ ...prev, [crackerId]: (prev[crackerId] || 0) + 1 }));
  };

  const removeFromCart = (crackerId) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[crackerId] > 1) newCart[crackerId] -= 1;
      else delete newCart[crackerId];
      return newCart;
    });
  };

  // ✅ Sort crackers based on radio selection
  const sortedCrackers = [...crackers].sort((a, b) => {
    if (sortType === "price") return a.price - b.price;
    return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
  });

  const getTotal = () => {
    return Object.entries(cart).reduce((total, [id, quantity]) => {
      const cracker = sortedCrackers.find((c) => c.id == id);
      return total + (cracker ? cracker.price * quantity : 0);
    }, 0);
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    autoTable(doc, {
      head: [["Item Name", "Quantity", "Price", "Subtotal"]],
      body: Object.entries(cart).map(([id, quantity]) => {
        const cracker = sortedCrackers.find((c) => c.id == id);
        return [
          cracker.name,
          quantity,
          `Rs. ${cracker.price}`,
          `Rs. ${cracker.price * quantity}`,
        ];
      }),
    });

    doc.text(`Total: Rs. ${getTotal()}`, 14, doc.lastAutoTable.finalY + 10);
    doc.save("cracker_invoice.pdf");
  };

  return (
    <div className="user-container">
      <header>
        <h1>|| Shree Ganeshay Namah ||</h1>
        <h1>💥 Cracker Shop [Contact - Anil 8446869619 ] 💥</h1>
      </header>

      {/* 🔘 Sort Controls */}
      <div className="sort-controls">
        <label>
          <input
            type="radio"
            name="sort"
            value="name"
            checked={sortType === "name"}
            onChange={(e) => setSortType(e.target.value)}
          />{" "}
          Sort by Name
        </label>
        <label>
          <input
            type="radio"
            name="sort"
            value="price"
            checked={sortType === "price"}
            onChange={(e) => setSortType(e.target.value)}
          />{" "}
          Sort by Price
        </label>
      </div>

      <main className="product-grid">
        {sortedCrackers.map((cracker) => (
          <div key={cracker.id} className="product-card">
            <img src={cracker.imageUrl} alt={cracker.name} />

            {cracker.videoUrl?.trim() && (
              <a
                href={cracker.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="video-link"
              >
                Watch video here!
              </a>
            )}
            
            <h3>{cracker.name}</h3>
            <p className="price">₹{cracker.price}</p>
            <div className="cart-controls">
              <button
                onClick={() => removeFromCart(cracker.id)}
                disabled={!cart[cracker.id]}
              >
                -
              </button>
              <span>{cart[cracker.id] || 0}</span>
              <button onClick={() => addToCart(cracker.id)}>+</button>
            </div>
          </div>
        ))}
      </main>

      {Object.keys(cart).length > 0 && (
        <footer className="cart-summary">
          <h2>🛒 Cart Summary</h2>
          <div className="total">
            <strong>Total: ₹{getTotal()}</strong>
          </div>
          <button onClick={generatePDF} className="download-btn">
            Download PDF
          </button>
        </footer>
      )}

      <style jsx>{`
        .user-container {
          text-align: center;
          padding: 20px;
        }
        header {
          margin-bottom: 20px;
        }
        .sort-controls {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 20px;
        }
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        .product-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 10px;
          background: #fff;
        }
        .product-card img {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 6px;
        }
        .cart-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
        }
        .cart-summary {
          margin-top: 30px;
          background: #f8f8f8;
          padding: 15px;
          border-radius: 8px;
        }
        .video-link {
          display: block;
          margin-top: 8px;
          color: #0070f3;
          text-decoration: underline;
          font-size: 14px;
          font-weight: 600;
        }
        
        .video-link:hover {
          color: #005bb5;
        }
        .download-btn {
          margin-top: 10px;
          padding: 10px 20px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .download-btn:hover {
          background-color: #005bb5;
        }
      `}</style>
    </div>
  );
}
