"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [auth, setAuth] = useState(false);
  const [crackers, setCrackers] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const load = async () => {
    const res = await fetch("/api/crackers");
    setCrackers(await res.json());
  };

  useEffect(() => {
    if (auth) load();
  }, [auth]);

  const checkPass = () => {
    if (password === "admin123") setAuth(true);
    else alert("Wrong password");
  };

  const submitCracker = async (e: any) => {
    e.preventDefault();
    if (!name || !price || !image) return alert("All fields required!");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("image", image);

    const res = await fetch("/api/crackers", { method: "POST", body: formData });
    if (res.ok) {
      alert("Cracker added!");
      setName("");
      setPrice("");
      setImage(null);
      load();
    }
  };

  const deleteCracker = async (name: string) => {
    if (!confirm("Delete this cracker?")) return;
    await fetch("/api/crackers/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    load();
  };

  const updatePrice = async (name: string, newPrice: string) => {
    if (!newPrice) return;
    await fetch("/api/crackers/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price: parseFloat(newPrice) }),
    });
    load();
  };

  if (!auth) {
    return (
      <div className="center-box">
        <h2>Admin Login</h2>
        <input
          type="password"
          placeholder="Enter Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={checkPass}>Login</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Add New Cracker</h2>
      <form onSubmit={submitCracker}>
        <input
          placeholder="Cracker Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          type="file"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />
        <button type="submit">Submit</button>
      </form>

      <h3>Existing Crackers</h3>
      <div className="grid">
        {crackers.map((c, i) => (
          <div className="card" key={i}>
            <img src={c.image} alt={c.name} />
            <h4>{c.name}</h4>
            <input
              type="number"
              defaultValue={c.price}
              onBlur={(e) => updatePrice(c.name, e.target.value)}
            />
            <button onClick={() => deleteCracker(c.name)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
