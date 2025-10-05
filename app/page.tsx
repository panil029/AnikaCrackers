"use client";
import { useEffect, useState } from "react";

export default function UserPage() {
  const [crackers, setCrackers] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  // Fetch crackers from your API
  useEffect(() => {
    fetch("/api/crackers")
      .then((res) => res.json())
      .then((data) => setCrackers(data))
      .catch((err) => console.error("Error fetching crackers:", err));
  }, []);

  // --- CART FUNCTIONS ---

  const addToCart = (cracker: any) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === cracker.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === cracker.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...cracker, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (cracker: any) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === cracker.id && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce(
    (sum, c) => sum + Number(c.price) * c.quantity,
    0
  );

  // --- EMAIL FUNCTION ---

  const handleSendEmail = () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const recipient = "your-email@example.com"; // 🔹 Change this to your email
    const subject = "Crackers Store - Cart Details";

    // Create formatted body
    let body = "🧨 Crackers Order Details 🧨\n\n";
    cart.forEach((item) => {
      body += `${item.name} - ₹${item.price} x ${item.quantity} = ₹${
        item.price * item.quantity
      }\n`;
    });

    body += `\n-----------------------\nTotal Amount: ₹${total}\n\nThank you for shopping with us!`;

    // Encode and open in default email app or browser
    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  // --- UI RENDER ---

  return (
    <div className="p-6 font-sans bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-700 mb-6 flex items-center">
        <span className="mr-2">🎆</span> Crackers Store
      </h1>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {crackers.map((c) => (
          <div
            key={c.id}
            className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition"
          >
            <img
              src={c.image}
              alt={c.name}
              className="w-[300px] h-[200px] object-cover mx-auto"
            />
            <div className="p-3 text-center">
              <h4 className="font-semibold text-gray-800">{c.name}</h4>
              <p className="text-green-700 font-medium">₹{c.price}</p>

              {/* Quantity Controls */}
              <div className="flex justify-center items-center space-x-2 mt-2">
                <button
                  onClick={() => removeFromCart(c)}
                  className="bg-gray-300 text-black px-2 py-1 rounded-lg hover:bg-gray-400"
                >
                  -
                </button>
                <span className="text-lg">
                  {cart.find((item) => item.id === c.id)?.quantity || 0}
                </span>
                <button
                  onClick={() => addToCart(c)}
                  className="bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => addToCart(c)}
                className="mt-2 bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Cart Info */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg text-lg">
          <div>🛒 Total: ₹{total}</div>
          <div className="mt-2 flex space-x-2">
            <button
              onClick={clearCart}
              className="bg-red-600 text-white px-4 py-1 rounded-lg hover:bg-red-700"
            >
              Clear Cart
            </button>
            <button
              onClick={handleSendEmail}
              className="bg-green-600 text-white px-4 py-1 rounded-lg hover:bg-green-700"
            >
              Send Email
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
