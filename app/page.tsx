"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type Cracker = {
  id: number;
  name: string;
  price: number;
  image: string;
  imageFilename: string;
};

type CartItem = Cracker & { qty: number };

export default function HomePage() {
  const [crackers, setCrackers] = useState<Cracker[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    loadCrackers();
    const saved = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  async function loadCrackers() {
    const res = await fetch("/api/crackers");
    const data = await res.json();
    setCrackers(data);
  }

  function addToCart(item: Cracker) {
    const idx = cart.findIndex((c) => c.imageFilename === item.imageFilename);
    if (idx === -1) {
      setCart([...cart, { ...item, qty: 1 }]);
    } else {
      const cp = [...cart];
      cp[idx].qty++;
      setCart(cp);
    }
  }

  function changeQty(filename: string, delta: number) {
    const cp = cart.map((c) => {
      if (c.imageFilename === filename) {
        const newQty = c.qty + delta;
        return { ...c, qty: newQty > 0 ? newQty : 1 };
      }
      return c;
    });
    setCart(cp);
  }

  function removeItem(filename: string) {
    setCart(cart.filter((c) => c.imageFilename !== filename));
  }

  const clientTotal = cart.reduce((s, c) => s + Number(c.price) * c.qty, 0);

  // Create PDF using latest prices fetched from server to prevent tampering
  async function downloadPDF() {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    // fetch latest trusted prices
    const res = await fetch("/api/crackers");
    const serverData: Cracker[] = await res.json();

    // Build rows using server prices matching imageFilename
    const rows = cart.map((ci) => {
      const serverItem = serverData.find((s) => s.imageFilename === ci.imageFilename);
      const price = serverItem ? Number(serverItem.price) : Number(ci.price);
      return { ...ci, price };
    });

    const total = rows.reduce((s, r) => s + r.price * r.qty, 0);

    // Create a printable element
    const container = document.createElement("div");
    container.style.width = "800px";
    container.style.padding = "20px";
    container.style.background = "white";
    container.innerHTML = `
      <h2 style="text-align:center">Crackers Invoice</h2>
      <table style="width:100%;border-collapse:collapse;margin-top:12px">
        <thead>
          <tr>
            <th style="border:1px solid #ddd;padding:6px">Image</th>
            <th style="border:1px solid #ddd;padding:6px">Name</th>
            <th style="border:1px solid #ddd;padding:6px">Qty</th>
            <th style="border:1px solid #ddd;padding:6px">Unit</th>
            <th style="border:1px solid #ddd;padding:6px">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (r) => `
            <tr>
              <td style="border:1px solid #ddd;padding:6px;text-align:center">
                <img src="${r.image}" width="60" height="60" style="object-fit:cover"/>
              </td>
              <td style="border:1px solid #ddd;padding:6px">${r.name}</td>
              <td style="border:1px solid #ddd;padding:6px;text-align:center">${r.qty}</td>
              <td style="border:1px solid #ddd;padding:6px;text-align:right">₹${r.price.toFixed(2)}</td>
              <td style="border:1px solid #ddd;padding:6px;text-align:right">₹${(r.price * r.qty).toFixed(2)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      <h3 style="text-align:right;margin-top:10px">Total: ₹${total.toFixed(2)}</h3>
    `;

    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container as HTMLElement, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`crackers-invoice-${Date.now()}.pdf`);
    } catch (err) {
      console.error(err);
      alert("PDF generation failed");
    } finally {
      document.body.removeChild(container);
      // reload prices on UI to ensure client displays latest server price
      loadCrackers();
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">🎇 Crackers Store</h1>

      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {crackers.map((c) => (
          <div key={c.imageFilename} className="bg-white rounded shadow overflow-hidden">
            <img src={c.image} alt={c.name} className="w-full h-48 object-cover" />
            <div className="p-3 text-center">
              <h3 className="font-semibold">{c.name}</h3>
              <p className="text-green-700">₹{c.price}</p>
              <button
                onClick={() => addToCart(c)}
                className="mt-2 bg-blue-600 text-white px-4 py-1 rounded"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart */}
      <div className="fixed bottom-6 right-6 bg-white shadow-lg p-4 rounded w-96 max-w-full">
        <h2 className="font-bold mb-2">🛒 Cart</h2>
        {cart.length === 0 ? (
          <p className="text-gray-500">No items</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-auto">
            {cart.map((item) => (
              <div key={item.imageFilename} className="flex items-center gap-3">
                <img src={item.image} width="50" height="50" className="object-cover rounded" />
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-500">₹{item.price} each</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => changeQty(item.imageFilename, -1)} className="px-2 py-0.5 bg-gray-200 rounded">-</button>
                  <div>{item.qty}</div>
                  <button onClick={() => changeQty(item.imageFilename, +1)} className="px-2 py-0.5 bg-gray-200 rounded">+</button>
                </div>
                <div className="text-right w-24">
                  <div>₹{(item.qty * item.price).toFixed(2)}</div>
                  <button onClick={() => removeItem(item.imageFilename)} className="text-sm text-red-500">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 flex justify-between items-center">
          <div className="text-lg font-bold">Total: ₹{clientTotal.toFixed(2)}</div>
          <div className="flex gap-2">
            <button onClick={downloadPDF} className="bg-green-600 text-white px-4 py-1 rounded">Download PDF</button>
            <button onClick={() => { setCart([]); localStorage.removeItem("cart"); }} className="bg-gray-300 px-3 py-1 rounded">Clear</button>
          </div>
        </div>
      </div>
    </div>
  );
}
