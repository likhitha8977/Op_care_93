import React, { useEffect, useState } from "react";

export default function ManageHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [form, setForm] = useState({
    name: "",
    city: "",
    type: "",
    details: "",
  });
  const [editingId, setEditingId] = useState(null);

  const fetchHospitals = async () => {
    try {
      const res = await fetch(
        `/api/hospitals?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`
      );
      const data = await res.json();
      setHospitals(data.hospitals || []);
    } catch (err) {
      console.error("Fetch hospitals error", err);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [q, page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/hospitals/${editingId}` : "/api/hospitals";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ name: "", city: "", type: "", details: "" });
        setEditingId(null);
        fetchHospitals();
      } else {
        console.error("Save hospital failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (h) => {
    setEditingId(h._id);
    setForm({ name: h.name, city: h.city, type: h.type, details: h.details });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this hospital?")) return;
    try {
      const res = await fetch(`/api/hospitals/${id}`, { method: "DELETE" });
      if (res.ok) fetchHospitals();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Manage Hospitals</h2>
      <div style={{ marginBottom: 10 }}>
        <input
          placeholder="Search by name or city"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          onClick={() => {
            setPage(1);
            fetchHospitals();
          }}
        >
          Search
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input
          required
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          required
          placeholder="City"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />
        <input
          placeholder="Type"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        />
        <input
          placeholder="Details"
          value={form.details}
          onChange={(e) => setForm({ ...form, details: e.target.value })}
        />
        <button type="submit">{editingId ? "Update" : "Add"}</button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({ name: "", city: "", type: "", details: "" });
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Name</th>
            <th>City</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {hospitals.map((h) => (
            <tr key={h._id}>
              <td>{h.name}</td>
              <td>{h.city}</td>
              <td>{h.type}</td>
              <td>
                <button onClick={() => handleEdit(h)}>Edit</button>
                <button onClick={() => handleDelete(h._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 10 }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
        <span style={{ margin: "0 8px" }}>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
}
