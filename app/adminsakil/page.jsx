"use client";

import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [crackers, setCrackers] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [editingCracker, setEditingCracker] = useState(null);

  useEffect(() => {
    fetchCrackers();
  }, []);

  const fetchCrackers = async () => {
    const res = await fetch('/api/crackers');
    const data = await res.json();
    setCrackers(data);
  };

  const resetForm = () => {
    setName(''); setPrice(''); setImage(null); setEditingCracker(null);
    document.getElementById('image-input').value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || (!image && !editingCracker)) {
      alert('Please fill all fields and select an image for new items.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    if (image) formData.append('image', image);
    formData.append('isUpdate', editingCracker ? 'true' : 'false');
    if (editingCracker) formData.append('id', editingCracker.id);

    const res = await fetch('/api/crackers', { method: 'POST', body: formData });

    if (res.ok) { fetchCrackers(); resetForm(); } 
    else { alert('Operation failed.'); }
  };

  const handleEdit = (cracker) => {
    setEditingCracker(cracker); setName(cracker.name); setPrice(cracker.price);
    setImage(null); window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this cracker?')) {
      const res = await fetch(`/api/crackers?id=${id}`, { method: 'DELETE' });
      if (res.ok) { fetchCrackers(); } 
      else { alert('Failed to delete cracker.'); }
    }
  };
  
  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>
      <form onSubmit={handleSubmit} className="admin-form">
        <h3>{editingCracker ? 'Edit Cracker' : 'Add New Cracker'}</h3>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
        <input id="image-input" type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
        <div className="form-buttons">
          <button type="submit">{editingCracker ? 'Update Cracker' : 'Add Cracker'}</button>
          {editingCracker && <button type="button" onClick={resetForm}>Cancel Edit</button>}
        </div>
      </form>

      <hr />
      <h2>Existing Crackers</h2>
      <div className="crackers-list">
        {crackers.map((cracker) => (
          <div key={cracker.id} className="cracker-item-admin">
            <img src={cracker.imageUrl} alt={cracker.name} width="80" height="80" />
            <div className="cracker-info">
              <strong>{cracker.name}</strong>
              <span>₹{cracker.price}</span>
            </div>
            <div className="cracker-actions">
              <button onClick={() => handleEdit(cracker)}>Edit</button>
              <button onClick={() => handleDelete(cracker.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}