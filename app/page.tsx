"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Home() {
  const [crackers, setCrackers] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/crackers").then(r => r.json()).then(setCrackers);
  }, []);

  const add = (c: any) => {
    const existing = cart.find((x) => x.name === c.name);
    if (existing) {
      existing.qty++;
      setCart([...cart]);
    } else setCart([...cart, { ...c, qty: 1 }]);
  };

  const remove = (c: any) => {
    const existing = cart.find((x) => x.name === c.name);
    if (existing) {
      existing.qty--;
      if (existing.qty <= 0) setCart(cart.filter(x => x.name !== c.name));
      else setCart([...cart]);
    }
  };

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("🎆 Crackers Order Summary", 14, 15);
    const rows = cart.map(c => [c.name, c.qty, `₹${c.price}`, `₹${c.price * c.qty}`]);
    (doc as any).autoTable({
      head: [["Cracker Name", "Qty", "Price", "Total"]],
      body: rows,
      startY: 25,
    });
    doc.text(`Grand Total: ₹${total}`, 14, (doc as any).lastAutoTable.finalY + 10);
    doc.save("cracker-order.pdf");
  };

  return (
    <div className="container">
      <h1 className="title">🎇 Crackers Store</h1>
      <div className="grid">
        {crackers.map((c, i) => (
          <div className="card" key={i}>
            <img src={c.image} alt={c.name} />
            <h4>{c.name}</h4>
            <p>₹{c.price}</p>
            <div className="qty">
              <button onClick={() => remove(c)}>-</button>
              <span>{cart.find(x => x.name === c.name)?.qty || 0}</span>
              <button onClick={() => add(c)}>+</button>
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="cart">
          <h3>🛒 Cart</h3>
          <table>
            <thead>
              <tr><th>Name</th><th>Qty</th><th>Price</th><th>Total</th></tr>
            </thead>
            <tbody>
              {cart.map((c, i) => (
                <tr key={i}><td>{c.name}</td><td>{c.qty}</td><td>₹{c.price}</td><td>₹{c.price * c.qty}</td></tr>
              ))}
            </tbody>
          </table>
          <h4>Grand Total: ₹{total}</h4>
          <button onClick={downloadPDF}>Download PDF</button>
        </div>
      )}
    </div>
  );
}
