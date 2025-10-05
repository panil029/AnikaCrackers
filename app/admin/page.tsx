// app/admin/page.tsx

"use client";

import { useState, useEffect, FormEvent } from "react";

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
  const [loading, setLoading] = useState(true);

  const loadCrackers = async () => {
    const res = await fetch("/api/crackers");
    const data = await res.json();
    setCrackers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCrackers();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name || !price || !file) {
      alert("Name, price, and image are required.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("image", file); // Key must match API route's formData.get("image")

    try {
      // 💡 NEW: Upload route handles both Cloudinary upload and JSON save
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add cracker.");
      }

      await loadCrackers(); // Reload data
      
      // Clear form
      setName("");
      setPrice("");
      setFile(null);
      (document.getElementById("file-input") as HTMLInputElement).value = ""; // Clear file input
      
    } catch (error: any) {
      alert(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this cracker?")) return;

    setLoading(true);

    try {
      const res = await fetch("/api/crackers/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete cracker.");
      }

      await loadCrackers(); // Reload data
    } catch (error: any) {
      alert(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-xl font-medium text-gray-600">
        Loading admin panel...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-center text-pink-600 mb-8">
        🌸 Admin Panel 🌸
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-6 mb-10 max-w-4xl mx-auto flex flex-wrap gap-4 items-end"
      >
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div className="flex-1 min-w-[100px]">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (₹)</label>
          <input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            step="0.01"
            required
          />
        </div>
        <div className="flex-1 min-w-[250px]">
          <label htmlFor="file-input" className="block text-sm font-medium text-gray-700">Image</label>
          <input
            id="file-input"
            type="file"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            className="mt-1 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
            accept="image/*"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition h-fit disabled:opacity-50"
          disabled={loading}
        >
          Add
        </button>
      </form>

      {/* Cracker Display Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {crackers.length === 0 ? (
          <p className="col-span-full text-center text-gray-600">No crackers added yet!</p>
        ) : (
          crackers.map((cracker) => (
            <div
              key={cracker.id}
              className="bg-white shadow-md rounded-2xl p-4 text-center"
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
                className="bg-red-500 text-white mt-3 px-5 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}