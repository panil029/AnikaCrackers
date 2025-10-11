"use client";

import { useEffect, useState } from "react";

type Cracker = {
  id: number;
  name: string;
  price: number;
  image: string;
  imageFilename: string;
};

const ADMIN_PASS = "crackeradmin123"; // change as needed

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pass, setPass] = useState("");
  const [crackers, setCrackers] = useState<Cracker[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [editing, setEditing] = useState<Cracker | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("isAdmin");
    if (saved === "true") {
      setAuthenticated(true);
      load();
    }
  }, []);

  async function load() {
    const res = await fetch("/api/crackers");
    const data = await res.json();
    setCrackers(data);
  }

  function login() {
    if (pass === ADMIN_PASS) {
      sessionStorage.setItem("isAdmin", "true");
      setAuthenticated(true);
      load();
    } else {
      alert("Incorrect passcode");
    }
  }

  async function uploadNew() {
    if (!name || !price || !file) return alert("Please fill all fields and select an image");
    const fd = new FormData();
    fd.append("name", name);
    fd.append("price", price);
    fd.append("image", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) {
      setName("");
      setPrice("");
      setFile(null);
      await load();
    } else {
      alert("Upload failed");
    }
  }

  function startEdit(c: Cracker) {
    setEditing(c);
    setEditName(c.name);
    setEditPrice(String(c.price));
    setEditFile(null);
  }

  async function saveEdit() {
    if (!editing) return;
    const fd = new FormData();
    fd.append("editId", String(editing.id));
    fd.append("name", editName);
    fd.append("price", editPrice);
    // include existingFilename so back-end knows if no new file uploaded
    fd.append("existingFilename", editing.imageFilename);
    if (editFile) fd.append("image", editFile);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) {
      setEditing(null);
      await load();
    } else {
      alert("Update failed");
    }
  }

  async function deleteByFilename(filename: string) {
    if (!confirm("Delete this cracker and its image?")) return;
    const res = await fetch("/api/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename })
    });
    if (res.ok) {
      await load();
    } else {
      alert("Delete failed");
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow w-full max-w-md">
          <h2 className="text-2xl mb-4">Admin - Enter Passcode</h2>
          <input
            type="password"
            className="w-full p-2 border rounded mb-3"
            placeholder="Passcode"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={login} className="bg-blue-600 text-white px-4 py-2 rounded">
              Enter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">💥 Crackers Admin</h1>
        <div>
          <button
            onClick={() => {
              sessionStorage.removeItem("isAdmin");
              setAuthenticated(false);
            }}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Add new */}
      <div className="bg-white p-4 rounded shadow mb-6 flex flex-wrap gap-3">
        <input className="border p-2 rounded w-64" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="border p-2 rounded w-40" placeholder="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        <input className="border p-2 rounded" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <button onClick={uploadNew} className="bg-green-600 text-white px-4 py-2 rounded">Add Cracker</button>
      </div>

      {/* Grid */}
      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {crackers.map((c) => (
          <div key={c.imageFilename} className="bg-white rounded shadow overflow-hidden">
            <img src={c.image} alt={c.name} className="w-full h-48 object-cover" />
            <div className="p-3 text-center">
              {editing && editing.id === c.id ? (
                <>
                  <input className="w-full border p-1 rounded mb-2" value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <input className="w-full border p-1 rounded mb-2" type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                  <input className="w-full mb-2" type="file" onChange={(e) => setEditFile(e.target.files?.[0] ?? null)} />
                  <div className="flex justify-center gap-2">
                    <button onClick={saveEdit} className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
                    <button onClick={() => setEditing(null)} className="bg-gray-300 px-3 py-1 rounded">Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="text-green-700">₹{c.price}</p>
                  <div className="flex justify-center gap-2 mt-2">
                    <button onClick={() => startEdit(c)} className="bg-yellow-400 px-3 py-1 rounded">Edit</button>
                    <button onClick={() => deleteByFilename(c.imageFilename)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
