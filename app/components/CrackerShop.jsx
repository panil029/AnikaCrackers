"use client";

import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function CrackerShop({ crackers }) {
  const [cart, setCart] = useState({});
  const [sortType, setSortType] = useState("name"); // default sort by name
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage]);

  // Products without an InStock property are treated as in stock.
  const addToCart = (crackerId) => {
    const cracker = crackers.find((item) => String(item.id) === String(crackerId));
    if (!cracker || cracker.InStock === false) return;

    setCart((prev) => ({
      ...prev,
      [crackerId]: (prev[crackerId] || 0) + 1
    }));
  };

  // Remove products from the cart if they become out of stock.
  useEffect(() => {
    setCart((prev) => {
      const nextCart = { ...prev };

      Object.keys(nextCart).forEach((id) => {
        const cracker = crackers.find((item) => String(item.id) === String(id));
        if (!cracker || cracker.InStock === false) delete nextCart[id];
      });

      return nextCart;
    });
  }, [crackers]);

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
      const cracker = sortedCrackers.find((c) => String(c.id) === String(id));
      if (!cracker || cracker.InStock === false) return total;
      return total + ((Number(cracker.price) || 0) * quantity);
    }, 0);
  };

  
  const generatePDF = () => {
    if (Object.keys(cart).length === 0) {
      alert("Please add items to your cart first.");
      return;
    }
  
    const customerName = window.prompt("Enter your name:");
    if (!customerName || !customerName.trim()) {
      alert("Name is required to generate the PDF.");
      return;
    }
  
    const societyName = window.prompt("Enter your society name:");
    if (!societyName || !societyName.trim()) {
      alert("Society name is required to generate the PDF.");
      return;
    }
  
    const doc = new jsPDF();
    const safeName = customerName
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "_")
      .slice(0, 60) || "Customer";
  
    doc.setFontSize(18);
    doc.text("Cracker Shop Invoice", 14, 20);
  
    doc.setFontSize(12);
    doc.text(`Customer Name: ${customerName.trim()}`, 14, 32);
    doc.text(`Society Name: ${societyName.trim()}`, 14, 40);
  
    autoTable(doc, {
      startY: 48,
      head: [["Item Name", "Quantity", "Price", "Subtotal"]],
      body: Object.entries(cart)
        .filter(([id]) => {
          const cracker = crackers.find((c) => String(c.id) === String(id));
          return cracker && cracker.InStock !== false;
        })
        .map(([id, quantity]) => {
          const cracker = crackers.find((c) => String(c.id) === String(id));
          const price = Number(cracker.price) || 0;

          return [
            cracker.name,
            quantity,
            `Rs. ${price}`,
            `Rs. ${price * quantity}`,
          ];
        }),
    });
  
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text(`Total: Rs. ${getTotal()}`, 14, finalY);
  
    doc.save(`${safeName}.pdf`);
  };


  return (
    <div className="user-container">
      <header>
        <h1>|| Shree Ganeshay Namah ||</h1>
        <h1>💥 Friendly Cracker Shop [Contact - <b>Anil - 8446869619] 💥</h1>
        <h2> NOTE : Click on image to enlarge and Videos also available, click on link below cracker </h2>
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
          <div
            key={cracker.id}
            className={`product-card ${cracker.InStock === false ? "out-of-stock-card" : ""}`}
            aria-disabled={cracker.InStock === false}
          >
            {cracker.InStock === false && (
              <div className="out-of-stock-label">OUT OF STOCK</div>
            )}

            <img
              src={cracker.imageUrl}
              alt={cracker.name}
              className="product-image"
              onClick={() => {
                if (cracker.InStock !== false) setSelectedImage(cracker);
              }}
              role={cracker.InStock === false ? undefined : "button"}
              tabIndex={cracker.InStock === false ? -1 : 0}
              onKeyDown={(e) => {
                if (
                  cracker.InStock !== false &&
                  (e.key === "Enter" || e.key === " ")
                ) {
                  e.preventDefault();
                  setSelectedImage(cracker);
                }
              }}
            />

            {cracker.videoUrl?.trim() && (
              <a
                href={cracker.InStock === false ? undefined : cracker.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="video-link"
                tabIndex={cracker.InStock === false ? -1 : 0}
                aria-disabled={cracker.InStock === false}
                onClick={(e) => {
                  if (cracker.InStock === false) e.preventDefault();
                }}
              >
                Watch video here!
              </a>
            )}

            <h3>{cracker.name}</h3>
            <p className="price">₹{cracker.price}</p>
            <div className="cart-controls">
              <button
                onClick={() => removeFromCart(cracker.id)}
                disabled={cracker.InStock === false || !cart[cracker.id]}
              >
                -
              </button>
              <span>{cracker.InStock === false ? 0 : (cart[cracker.id] || 0)}</span>
              <button
                onClick={() => addToCart(cracker.id)}
                disabled={cracker.InStock === false}
              >
                +
              </button>
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

      {selectedImage && (
        <div
          className="image-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedImage.name} image preview`}
          onClick={() => setSelectedImage(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setSelectedImage(null);
          }}
        >
          <button
            type="button"
            className="image-modal-close"
            onClick={() => setSelectedImage(null)}
            aria-label="Close image preview"
          >
            &times;
          </button>
          <img
            src={selectedImage.imageUrl}
            alt={selectedImage.name}
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <style jsx>{`
        .user-container {
          min-height: 100vh;
          padding: 28px 24px;
          text-align: center;
          background: #fff9f0;
          color: #302820;
          font-family: Arial, Helvetica, sans-serif;
        }
        
        header {
          margin-bottom: 24px;
          padding: 20px 12px;
          background: #702632;
          color: #fffaf2;
          border-bottom: 4px solid #d4a64a;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(75, 35, 25, 0.12);
        }
        
        header h1 {
          margin: 8px 0 14px;
          line-height: 1.4;
          font-size: clamp(20px, 2.5vw, 30px);
          font-weight: 700;
        }
        
        .sort-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px 24px;
          margin-bottom: 24px;
          color: #702632;
          font-weight: 600;
        }
        
        .sort-controls label {
          cursor: pointer;
        }
        
        .sort-controls input {
          accent-color: #702632;
          margin-right: 6px;
        }
        
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
          gap: 20px;
          max-width: 1250px;
          margin: 0 auto;
        }
        
        .product-card {
          min-width: 0;
          padding: 12px;
          background: #ffffff;
          border: 1px solid #e5d4b8;
          border-bottom: 4px solid #d4a64a;
          border-radius: 12px;
          box-shadow: 0 3px 10px rgba(75, 35, 25, 0.08);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .product-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 7px 18px rgba(75, 35, 25, 0.14);
        }

        .out-of-stock-card {
          position: relative;
          opacity: 0.5;
          cursor: not-allowed;
        }

        .out-of-stock-card:hover {
          transform: none;
          box-shadow: 0 3px 10px rgba(75, 35, 25, 0.08);
        }

        .out-of-stock-card * {
          pointer-events: none;
        }

        .out-of-stock-label {
          position: absolute;
          top: 50%;
          left: 50%;
          z-index: 2;
          transform: translate(-50%, -50%) rotate(-12deg);
          padding: 9px 14px;
          border: 2px solid #ffffff;
          border-radius: 6px;
          background: #702632;
          color: #ffffff;
          font-size: 16px;
          font-weight: 900;
          letter-spacing: 1px;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
          pointer-events: none;
        }
        
        .product-card img {
          display: block;
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 8px;
          background: #f5eee3;
        }
        
        .product-image {
          cursor: zoom-in;
        }

        .image-modal {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.85);
        }

        .image-modal-content {
          display: block;
          max-width: 95vw;
          max-height: 85vh;
          width: auto;
          height: auto;
          object-fit: contain;
          border-radius: 8px;
          cursor: default;
        }

        .image-modal-close {
          position: absolute;
          top: 15px;
          right: 20px;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          padding: 0;
          border: none;
          border-radius: 50%;
          background: #ffffff;
          color: #702632;
          font-size: 32px;
          line-height: 1;
          cursor: pointer;
        }

        .image-modal-close:hover {
          background: #fff0dc;
        }

        .product-card h3 {
          min-height: 42px;
          margin: 12px 0 8px;
          color: #702632;
          font-size: 15px;
          line-height: 1.4;
        }
        
        .video-link {
          display: block;
          margin: 8px 0;
          color: #8b4b08;
          font-size: 15px;
          font-weight: 900;
          text-decoration: underline;
        }
        
        .video-link:hover {
          color: #702632;
        }
        
        .price {
          margin: 12px 0;
          color: #238447;
          font-size: 17px;
          font-weight: 700;
        }
        
        .cart-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin-top: 16px;
        }
        
        .cart-controls button {
          width: 36px;
          height: 36px;
          border: 1px solid #d9c7ad;
          border-radius: 50%;
          background: #fff9f0;
          color: #702632;
          font-size: 20px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        
        .cart-controls button:hover:not(:disabled) {
          background: #f1dfc0;
        }
        
        .cart-controls button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        
        .cart-controls span {
          min-width: 16px;
          font-weight: 700;
        }
        
        .cart-summary {
          max-width: 600px;
          margin: 32px auto 0;
          padding: 22px;
          background: #ffffff;
          border: 1px solid #e5d4b8;
          border-top: 4px solid #d4a64a;
          border-radius: 12px;
          box-shadow: 0 4px 14px rgba(75, 35, 25, 0.08);
        }
        
        .cart-summary h2 {
          color: #702632;
        }
        
        .total {
          color: #238447;
          font-size: 20px;
        }
        
        .download-btn {
          margin-top: 14px;
          padding: 12px 24px;
          background: #702632;
          color: #ffffff;
          border: 1px solid #702632;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        
        .download-btn:hover {
          background: #541b25;
        }
        
        @media (max-width: 600px) {
            .user-container {
              padding: 14px 10px;
            }
          
            header {
              padding: 14px 8px;
            }
          
            .product-grid {
              grid-template-columns: 1fr;
              gap: 14px;
            }
          
            .product-card {
              padding: 10px;
            }
          
            .product-card img {
              height: 200px;
              object-fit: contain;
            }
          
            .cart-controls {
              gap: 12px;
            }
          }
      `}</style>
    </div>
  );
}
