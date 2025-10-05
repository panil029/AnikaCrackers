"use client";
import { useState, useEffect } from "react";

export default function AdminPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [crackers, setCrackers] = useState([]);

  useEffect(() => {
    fetchCrackers();
  }, []);

  const fetchCrackers = async () => {
    const res = await fetch("/api/crackers");
    const data = await res.json();
    setCrackers(data);
    localStorage.setItem("crackers", JSON.stringify(data)); // sync user page
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name || !price) return alert("All fields required!");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("name", name);
    formData.append("price", price);

    await fetch("/api/upload", { method: "POST", body: formData });
    setName("");
    setPrice("");
    setFile(null);
    fetchCrackers();
  };

  const handleDelete = async (id: number) => {
    await fetch("/api/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchCrackers();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">💥 Admin Panel</h1>
      <form onSubmit={handleUpload} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border p-2 rounded"
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded">Add</button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {crackers.map((c: any) => (
          <div key={c.id} className="p-2 border rounded-lg shadow">
            <img
              src={c.image}
              alt={c.name}
              className="w-full h-48 object-cover rounded-lg"
            />
            <h3 className="text-center mt-2 font-semibold">{c.name}</h3>
            <p className="text-green-600 text-center">₹{c.price}</p>
            <button
              onClick={() => handleDelete(c.id)}
              className="w-full bg-red-500 text-white rounded py-1 mt-2"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
