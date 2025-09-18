import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import '../styles/profile.css';

const Profile = () => {
  const { user, logout } = useContext(UserContext);
  const [profile, setProfile] = React.useState(null);
  const [editMode, setEditMode] = React.useState(false);
  const [form, setForm] = React.useState({ fullName: '', email: '', phone: '' });

  React.useEffect(() => {
    if (user) {
      const token = user?.token;
      fetch('/api/profile', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })
        .then(async res => {
          if (res.status === 401) {
            setProfile(null);
            setForm({ fullName: '', email: '', phone: '' });
            return;
          }
          const data = await res.json();
          setProfile(data);
          setForm({
            fullName: data.fullName || '',
            email: data.email || '',
            phone: data.phone || ''
          });
        });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="profile-container">
        <h2>My Profile</h2>
        <div className="profile-details">
          <p>No user logged in. Please sign in or sign up.</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <h2>My Profile</h2>
        <div className="profile-details">
          <p style={{color:'red'}}>Unauthorized or session expired. Please log in again.</p>
        </div>
      </div>
    );
  }

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => setEditMode(false);
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSave = async e => {
    e.preventDefault();
    try {
      const token = user?.token;
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setEditMode(false);
        alert('Profile updated!');
      } else {
        alert(data.error || 'Update failed');
      }
    } catch (err) {
      alert('Update error: ' + err.message);
    }
  };

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      <div className="profile-details">
        {editMode ? (
          <form onSubmit={handleSave}>
            <label>
              Name:
              <input name="fullName" value={form.fullName} onChange={handleChange} />
            </label>
            <label>
              Email:
              <input name="email" value={form.email} onChange={handleChange} />
            </label>
            <label>
              Phone:
              <input name="phone" value={form.phone} onChange={handleChange} />
            </label>
            <button type="submit" className="book-btn">Save</button>
            <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
          </form>
        ) : (
          <>
            <p><strong>Name:</strong> {profile?.fullName}</p>
            <p><strong>Email:</strong> {profile?.email}</p>
            <p><strong>Phone:</strong> {profile?.phone}</p>
            <p><strong>Role:</strong> {profile?.role}</p>
            <button className="book-btn" onClick={handleEdit}>Edit</button>
            <button className="cancel-btn" onClick={logout} style={{marginTop:'1rem'}}>Logout</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
