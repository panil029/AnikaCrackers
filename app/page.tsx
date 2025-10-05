// app/page.tsx

"use client";

import { useEffect, useState } from "react";

interface Cracker {
  id: number;
  name: string;
  price: string;
  imageUrl: string;
}

export default function HomePage() {
  const [crackers, setCrackers] = useState<Cracker[]>([]);
  const [cart, setCart] = useState<Cracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailSending, setEmailSending] = useState(false);

  // Fetch crackers from backend
  useEffect(() => {
    async function load() {
      const res = await fetch("/api/crackers");
      const data = await res.json();
      setCrackers(data);
      setLoading(false);
    }
    load();
  }, []);

  // Add to cart
  const addToCart = (cracker: Cracker) => {
    setCart([...cart, cracker]);
  };

  // Remove item from cart
  const removeFromCart = (index: number) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Calculate total
  const totalAmount = cart.reduce(
    (sum, item) => sum + parseFloat(item.price),
    0
  );

  // Send Email Order
  const sendEmail = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
  
    const userEmail = prompt("Please enter your email to send the order:");
  
    if (!userEmail || !userEmail.includes("@")) {
      alert("Valid email required to send order.");
      return;
    }
  
    setEmailSending(true);
  
    const orderDetails = cart
      .map((c) => `${c.name} - ₹${c.price}`)
      .join("\n");
  
    // Calculate total to 2 decimal places for display
    const formattedTotal = totalAmount.toFixed(2);
  
    const res = await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: "🎇 New Crackers Order",
        message: `${orderDetails}\n\nTotal: ₹${formattedTotal}`,
        userEmail,
      }),
    });
  
    setEmailSending(false);
  
    if (res.ok) {
      alert("Order email sent successfully!");
      clearCart();
    } else {
      alert("Failed to send order email.");
    }
  };
  

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-xl font-medium text-gray-600">
        Loading crackers...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-center text-pink-600 mb-8">
        🎆 Crackers Store 🎇
      </h1>

      {/* Crackers Grid */}
      {crackers.length === 0 ? (
        <p className="text-center text-gray-600">No crackers available yet!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {crackers.map((cracker) => (
            <div
              key={cracker.id}
              className="bg-white shadow-md rounded-2xl p-4 text-center hover:shadow-xl transition"
            >
              <img
                src={cracker.imageUrl}
                alt={cracker.name}
                className="w-full h-48 object-cover rounded-xl"
              />
              <h3 className="mt-3 text-lg font-semibold text-gray-800">
                {cracker.name}
              </h3>
              <p className="text-green-600 font-bold">₹{cracker.price}</p>
              <button
                onClick={() => addToCart(cracker)}
                className="bg-pink-500 text-white mt-3 px-5 py-2 rounded-lg hover:bg-pink-600 transition"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Cart Section */}
      {cart.length > 0 && (
        <div className="mt-12 bg-white shadow-md rounded-2xl p-6 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            🛒 Your Cart
          </h2>
          <ul className="divide-y divide-gray-200">
            {cart.map((item, index) => (
              <li
                key={index}
                className="flex justify-between items-center py-2 text-gray-700"
              >
                <span>
                  {item.name} - ₹{item.price}
                </span>
                <button
                  onClick={() => removeFromCart(index)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="text-right mt-4 text-lg font-semibold text-green-700">
            Total: ₹{totalAmount.toFixed(2)}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6">
            <button
              onClick={clearCart}
              className="bg-gray-400 text-white px-5 py-2 rounded-lg hover:bg-gray-500 transition"
            >
              Clear Cart
            </button>
            <button
              onClick={sendEmail}
              disabled={emailSending}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {emailSending ? "Sending..." : "Send Order Email"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}