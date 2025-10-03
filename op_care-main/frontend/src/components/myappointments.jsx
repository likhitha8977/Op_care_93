import React, { useEffect, useState } from 'react';
import '../styles/bookings.css';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch appointments from backend
    const storedUser = JSON.parse(localStorage.getItem('opcare_user'));
    const token = storedUser?.token;
    setLoading(true);
    setError("");
    fetch('/api/bookings', {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to fetch appointments');
        }
        return res.json();
      })
      .then(data => setAppointments(data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = idx => {
    // Cancel appointment in backend
    const storedUser = JSON.parse(localStorage.getItem('opcare_user'));
    const token = storedUser?.token;
    const apptId = appointments[idx]._id;
    fetch(`/api/bookings/${apptId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    })
      .then(res => res.json())
      .then(() => {
        setAppointments(appointments.filter((_, i) => i !== idx));
      });
  };

  const handleEdit = idx => {
    setEditIdx(idx);
    setEditData(appointments[idx]);
  };

  const handleEditChange = e => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = e => {
    e.preventDefault();
    // Update appointment in backend
    const storedUser = JSON.parse(localStorage.getItem('opcare_user'));
    const token = storedUser?.token;
    const apptId = appointments[editIdx]._id;
    fetch(`/api/bookings/${apptId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(editData)
    })
      .then(res => res.json())
      .then(updatedAppt => {
        const updated = appointments.map((appt, i) => i === editIdx ? updatedAppt : appt);
        setAppointments(updated);
        setEditIdx(null);
      });
  };

  return (
    <div className="bookings-container">
      <h2>My Appointments</h2>
      {loading ? (
        <p>Loading appointments...</p>
      ) : error ? (
        <p style={{color:'red'}}>Error: {error}</p>
      ) : appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <ul className="bookings-list">
          {appointments.map((appt, idx) => (
            <li className="booking-item" key={appt._id || idx}>
              {editIdx === idx ? (
                <form onSubmit={handleEditSubmit} style={{display:'flex',gap:'1rem',alignItems:'center'}}>
                  <input name="service" value={editData.service} onChange={handleEditChange} required placeholder="Service" />
                  <input name="date" value={editData.date} onChange={handleEditChange} required type="date" />
                  <button type="submit" className="book-btn">Save</button>
                  <button type="button" className="cancel-btn" onClick={()=>setEditIdx(null)}>Cancel</button>
                </form>
              ) : (
                <div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.25rem' }}>
                    <span>
                      <strong>{appt.service}</strong>
                      {` @ ${appt?.hospital?.name || (typeof appt.hospital === 'string' ? appt.hospital : 'Hospital')}`}
                      {` on ${appt.date}`}
                    </span>
                    <span>
                      <em>Status: {appt.status || 'booked'}</em>
                      {` | Type: ${appt.consultationType || 'in_person'}`}
                      {appt.consultationType === 'video' && appt.videoLink && (
                        <>
                          {` | `}
                          <a href={appt.videoLink} target="_blank" rel="noreferrer">Join Video</a>
                        </>
                      )}
                    </span>
                  </div>
                  <div>
                    <button className="view-btn" onClick={()=>handleEdit(idx)}>Reschedule</button>
                    <button className="cancel-btn" onClick={()=>handleCancel(idx)}>Cancel</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyAppointments;
