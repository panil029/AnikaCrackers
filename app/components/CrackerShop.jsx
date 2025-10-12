"use client";

import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Import autoTable as a function

export default function CrackerShop({ crackers }) {
  const [cart, setCart] = useState({});

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

  const getTotal = () => {
    return Object.entries(cart).reduce((total, [id, quantity]) => {
      const cracker = crackers.find((c) => c.id == id);
      return total + (cracker ? cracker.price * quantity : 0);
    }, 0);
  };
  
  const generatePDF = () => {
    const doc = new jsPDF();

    // Use autoTable as a function, passing the doc instance to it
    // This is the main fix
    autoTable(doc, { 
      head: [["Item Name", "Quantity", "Price", "Subtotal"]],
      body: Object.entries(cart).map(([id, quantity]) => {
          const cracker = crackers.find(c => c.id == id);
          return [cracker.name, quantity, `Rs. ${cracker.price}`, `Rs. ${cracker.price * quantity}`];
      }),
    });

    doc.text(`Total: Rs. ${getTotal()}`, 14, doc.lastAutoTable.finalY + 10);
    doc.save("cracker_invoice.pdf");
  };

  return (
    <div className="user-container">
      <header><h1>💥 Cracker Shop 💥</h1></header>
      <main className="product-grid">
        {crackers.map((cracker) => (
          <div key={cracker.id} className="product-card">
            <img src={cracker.imageUrl} alt={cracker.name} />
            <h3>{cracker.name}</h3>
            <p className="price">₹{cracker.price}</p>
            <div className="cart-controls">
              <button onClick={() => removeFromCart(cracker.id)} disabled={!cart[cracker.id]}>-</button>
              <span>{cart[cracker.id] || 0}</span>
              <button onClick={() => addToCart(cracker.id)}>+</button>
            </div>
          </div>
        ))}
      </main>

      {Object.keys(cart).length > 0 && (
        <footer className="cart-summary">
          <h2>🛒 Cart Summary</h2>
          <div className="total"><strong>Total: ₹{getTotal()}</strong></div>
          <button onClick={generatePDF} className="download-btn">Download PDF</button>
        </footer>
      )}
    </div>
  );
}