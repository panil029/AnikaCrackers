"use client";

import { useEffect, useState } from "react";

interface Cracker {
  id: number;
  name: string;
  price: string;
  imageUrl: string;
}

export default function AdminPage() {
  const [crackers, setCrackers] = useState<Cracker[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch crackers
  useEffect(() => {
    async function load() {
      const res = await fetch("/api/crackers");
      const data = await res.json();
      setCrackers(data);
    }
    load();
  }, []);

  // Upload new cracker
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !file) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("image", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (res.ok) {
      setCrackers([...crackers, data]);
      setName("");
      setPrice("");
      setFile(null);
    } else {
      alert("Error uploading cracker");
    }

    setLoading(false);
  };

  // Delete cracker
  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/delete?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setCrackers(crackers.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-pink-600">
        💥 Admin Panel 💥
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3 mb-8 justify-center"
      >
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded-lg px-3 py-2 flex-1"
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border rounded-lg px-3 py-2 flex-1"
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border rounded-lg px-3 py-2 flex-1"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
        >
          {loading ? "Uploading..." : "Add"}
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {crackers.map((cracker) => (
          <div
            key={cracker.id}
            className="bg-white shadow-md rounded-2xl p-4 text-center hover:shadow-lg transition"
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
              onClick={() => handleDelete(cracker.id)}
              className="bg-red-500 text-white mt-3 px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
