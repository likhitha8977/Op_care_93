import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/adminDashboard.css";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({ totalUsers: 0, totalAppointments: 0, totalHospitals: 0, pendingApprovals: 0 });
  const [hospitals, setHospitals] = useState([]);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [operations, setOperations] = useState([]);
  const [notificationsList, setNotificationsList] = useState([]);
  // Admin calendar view state
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [doctorAvailability, setDoctorAvailability] = useState(null);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [newHospital, setNewHospital] = useState({ name: '', address: '', phone: '', email: '' });
  const [userPage, setUserPage] = useState(1);
  const [apptPage, setApptPage] = useState(1);
  const pageSize = 10;
  const [newOperation, setNewOperation] = useState({ doctor: '', patient: '', date: '', type: '', outcome: '', notes: '' });
  const [newNotification, setNewNotification] = useState({ message: '', roleTarget: 'all' });

  const authHeaders = () => {
    const stored = JSON.parse(localStorage.getItem('opcare_user') || '{}');
    const token = stored?.token;
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  const loadAll = async () => {
    try {
      const [statsRes, hospRes, usersRes, apptRes, opsRes, notesRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: authHeaders() }).then(r => r.json()),
        fetch('/api/admin/hospitals', { headers: authHeaders() }).then(r => r.json()),
        fetch('/api/admin/users', { headers: authHeaders() }).then(r => r.json()),
        fetch('/api/admin/appointments', { headers: authHeaders() }).then(r => r.json()),
        fetch('/api/admin/operations', { headers: authHeaders() }).then(r => r.json()).catch(()=>[]),
        fetch('/api/admin/notifications', { headers: authHeaders() }).then(r => r.json()).catch(()=>[]),
      ]);
      setStats(statsRes || {});
      setHospitals(Array.isArray(hospRes) ? hospRes : []);
      setUsers(Array.isArray(usersRes) ? usersRes : []);
      setAppointments(Array.isArray(apptRes) ? apptRes : []);
      setOperations(Array.isArray(opsRes) ? opsRes : []);
      setNotificationsList(Array.isArray(notesRes) ? notesRes : []);
    } catch (e) {
      console.error('Admin data load failed', e);
    }
  };

  useEffect(() => { loadAll(); }, []);

  // Filtering helpers
  const norm = (s) => (s || '').toString().toLowerCase();
  const filteredUsers = users.filter(u => {
    if (!searchQuery) return true;
    const q = norm(searchQuery);
    return norm(u.fullName).includes(q) || norm(u.email).includes(q) || norm(u.role).includes(q);
  });
  const usersPageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const usersPageItems = filteredUsers.slice((userPage - 1) * pageSize, userPage * pageSize);

  const filteredAppointments = appointments.filter(a => {
    if (!searchQuery) return true;
    const q = norm(searchQuery);
    return norm(a?.user?.fullName).includes(q) || norm(a?.doctor?.fullName).includes(q) || norm(a?.hospital?.name).includes(q) || norm(a.status).includes(q);
  });
  const apptPageCount = Math.max(1, Math.ceil(filteredAppointments.length / pageSize));
  const apptPageItems = filteredAppointments.slice((apptPage - 1) * pageSize, apptPage * pageSize);

  // Actions
  const updateUserRole = async (userId, role) => {
    try {
      await fetch(`/api/admin/users/${userId}/role`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ role }) });
      await loadAll();
    } catch (e) { console.error('Failed to update role', e); }
  };

  const deleteUser = async (userId) => {
    try {
      await fetch(`/api/admin/users/${userId}`, { method: 'DELETE', headers: authHeaders() });
      await loadAll();
    } catch (e) { console.error('Failed to delete user', e); }
  };

  const saveHospital = async (h) => {
    try {
      const payload = { name: h.name, address: h.address, phone: h.phone, email: h.email };
      await fetch(`/api/admin/hospitals/${h._id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(payload) });
      await loadAll();
    } catch (e) { console.error('Failed to update hospital', e); }
  };

  const removeHospital = async (id) => {
    try {
      await fetch(`/api/admin/hospitals/${id}`, { method: 'DELETE', headers: authHeaders() });
      await loadAll();
    } catch (e) { console.error('Failed to delete hospital', e); }
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      await fetch(`/api/admin/appointments/${id}/status`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status }) });
      await loadAll();
    } catch (e) { console.error('Failed to update appointment', e); }
  };

  const rescheduleAppointment = async (id, newDate) => {
    try {
      await fetch(`/api/admin/appointments/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ date: newDate, status: 'rescheduled' }) });
      await loadAll();
    } catch (e) { console.error('Failed to reschedule appointment', e); }
  };

  // Operations actions
  const createOperationAdmin = async () => {
    try {
      await fetch('/api/admin/operations', { method: 'POST', headers: authHeaders(), body: JSON.stringify(newOperation) });
      setNewOperation({ doctor: '', patient: '', date: '', type: '', outcome: '', notes: '' });
      await loadAll();
    } catch (e) { console.error('Failed to create operation', e); }
  };

  const updateOperationAdmin = async (op) => {
    try {
      await fetch(`/api/admin/operations/${op._id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(op) });
      await loadAll();
    } catch (e) { console.error('Failed to update operation', e); }
  };

  const deleteOperationAdmin = async (id) => {
    try {
      await fetch(`/api/admin/operations/${id}`, { method: 'DELETE', headers: authHeaders() });
      await loadAll();
    } catch (e) { console.error('Failed to delete operation', e); }
  };

  // Notifications actions
  const createNotificationAdmin = async () => {
    try {
      await fetch('/api/admin/notifications', { method: 'POST', headers: authHeaders(), body: JSON.stringify(newNotification) });
      setNewNotification({ message: '', roleTarget: 'all' });
      await loadAll();
    } catch (e) { console.error('Failed to create notification', e); }
  };

  const deleteNotificationAdmin = async (id) => {
    try {
      await fetch(`/api/admin/notifications/${id}`, { method: 'DELETE', headers: authHeaders() });
      await loadAll();
    } catch (e) { console.error('Failed to delete notification', e); }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'hospitals', label: 'Manage Hospitals', icon: '🏥' },
    { id: 'doctors', label: 'Manage Doctors', icon: '👨‍⚕️' },
    { id: 'calendar', label: 'Doctor Calendar', icon: '📅' },
    { id: 'appointments', label: 'Appointments Overview', icon: '📋' },
    { id: 'operations', label: 'Operations / Surgeries', icon: '🧑‍⚕️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'reports', label: 'Reports/Analytics', icon: '📈' },
  ];

  const renderDashboardOverview = () => (
    <div className="dashboard-overview">
      <h2>Dashboard Overview</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏥</div>
          <div className="stat-number">{stats.totalHospitals}</div>
          <div className="stat-label">Total Hospitals</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍⚕️</div>
          <div className="stat-number">{users.filter(u => u.role === 'doctor').length}</div>
          <div className="stat-label">Total Doctors</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-number">{stats.totalAppointments}</div>
          <div className="stat-label">Total Appointments</div>
        </div>
      </div>
    </div>
  );

  const createHospital = async () => {
    try {
      await fetch('/api/admin/hospitals', { method: 'POST', headers: authHeaders(), body: JSON.stringify(newHospital) });
      setNewHospital({ name: '', address: '', phone: '', email: '' });
      await loadAll();
    } catch (e) { console.error('Failed to create hospital', e); }
  };

  const renderManageHospitals = () => (
    <div className="manage-hospitals">
      <div className="section-header">
        <h2>Manage Hospitals</h2>
        <div className="profile-form" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input placeholder="Name" value={newHospital.name} onChange={(e)=>setNewHospital({ ...newHospital, name: e.target.value })} />
          <input placeholder="Address" value={newHospital.address} onChange={(e)=>setNewHospital({ ...newHospital, address: e.target.value })} />
          <input placeholder="Phone" value={newHospital.phone} onChange={(e)=>setNewHospital({ ...newHospital, phone: e.target.value })} />
          <input placeholder="Email" value={newHospital.email} onChange={(e)=>setNewHospital({ ...newHospital, email: e.target.value })} />
          <button className="add-btn" onClick={createHospital}>+ Add Hospital</button>
        </div>
      </div>
      <div className="hospitals-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hospitals.map(hospital => (
              <tr key={hospital._id}>
                <td><input defaultValue={hospital.name} onBlur={(e)=>{ hospital.name = e.target.value; }} /></td>
                <td><input defaultValue={hospital.address} onBlur={(e)=>{ hospital.address = e.target.value; }} /></td>
                <td><input defaultValue={hospital.phone} onBlur={(e)=>{ hospital.phone = e.target.value; }} /></td>
                <td><input defaultValue={hospital.email} onBlur={(e)=>{ hospital.email = e.target.value; }} /></td>
                <td>
                  <button className="action-btn edit" onClick={() => saveHospital(hospital)}>Save</button>
                  <button className="action-btn delete" onClick={() => removeHospital(hospital._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderManageDoctors = () => {
    const doctors = users.filter(u => u.role === 'doctor');
    const filteredDoctors = usersPageItems.filter(u => u.role === 'doctor');
    return (
    <div className="manage-doctors">
      <div className="section-header">
        <h2>Manage Doctors</h2>
        <button className="add-btn">+ Add Doctor</button>
      </div>
      <div className="doctors-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.map(doctor => (
              <tr key={doctor._id}>
                <td>{doctor.fullName}</td>
                <td>{doctor.email}</td>
                <td>{doctor.phone || '-'}</td>
                <td>
                  <select defaultValue={doctor.role} onChange={(e) => updateUserRole(doctor._id, e.target.value)}>
                    <option value="patient">patient</option>
                    <option value="doctor">doctor</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td>
                  <button className="action-btn delete" onClick={() => deleteUser(doctor._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:'0.75rem' }}>
          <span>Showing {filteredDoctors.length} of {filteredUsers.filter(u=>u.role==='doctor').length} doctors</span>
          <div>
            <button className="action-btn" disabled={userPage<=1} onClick={()=>setUserPage(p=>Math.max(1,p-1))}>Prev</button>
            <span style={{ margin:'0 0.5rem' }}>{userPage} / {usersPageCount}</span>
            <button className="action-btn" disabled={userPage>=usersPageCount} onClick={()=>setUserPage(p=>Math.min(usersPageCount,p+1))}>Next</button>
          </div>
        </div>
      </div>
    </div>
  ); };

  // Load a doctor's availability for calendar view
  const loadDoctorAvailability = async () => {
    try {
      if (!selectedDoctorId) { alert('Please select a doctor'); return; }
      setCalendarLoading(true);
      const data = await fetch(`/api/admin/doctors/${selectedDoctorId}/availability`, { headers: authHeaders() }).then(r => r.json());
      setDoctorAvailability(data || {});
    } catch (e) {
      console.error('Failed to load doctor availability', e);
    } finally {
      setCalendarLoading(false);
    }
  };

  const renderDoctorCalendar = () => {
    const doctors = users.filter(u => u.role === 'doctor');
    return (
    <div className="doctor-calendar">
      <h2>Doctor Calendar Management</h2>
      <div className="calendar-controls">
        <select className="doctor-select" value={selectedDoctorId} onChange={(e)=>{ setSelectedDoctorId(e.target.value); setDoctorAvailability(null); }}>
          <option value="">Select Doctor</option>
          {doctors.map(doctor => (
            <option key={doctor._id} value={doctor._id}>
              {doctor.fullName}
            </option>
          ))}
        </select>
        <button className="view-slots-btn" onClick={loadDoctorAvailability}>View Slots</button>
      </div>
      <div className="calendar-view">
        {!selectedDoctorId && (
          <p>Select a doctor to view and manage their available slots.</p>
        )}
        {selectedDoctorId && calendarLoading && (
          <p>Loading availability...</p>
        )}
        {selectedDoctorId && !calendarLoading && doctorAvailability && (
          <div className="availability-summary" style={{ marginTop: '0.75rem' }}>
            <p><strong>Status:</strong> {doctorAvailability.status || 'Available'}</p>
            <p><strong>Visiting Hours:</strong> {doctorAvailability.hours || '-'}</p>
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#555' }}>
              <em>Slots are based on the doctor's visiting hours. For structured slotting, store hours in a structured format (e.g., per-day ranges).</em>
            </div>
          </div>
        )}
        {selectedDoctorId && !calendarLoading && !doctorAvailability && (
          <p>No availability set for this doctor.</p>
        )}
        <div className="slot-legend">
          <span className="legend-item">🟢 Available</span>
          <span className="legend-item">🔴 Emergency</span>
          <span className="legend-item">🔵 Booked</span>
        </div>
      </div>
    </div>
  ); };

  const renderAppointmentsOverview = () => (
    <div className="appointments-overview">
      <div className="section-header">
        <h2>Appointments Overview</h2>
        <div className="filters">
          <select>
            <option>All Hospitals</option>
            {hospitals.map(hospital => (
              <option key={hospital._id} value={hospital._id}>
                {hospital.name}
              </option>
            ))}
          </select>
          <input type="date" />
        </div>
      </div>
      <div className="appointments-list">
        {apptPageItems.map(appointment => (
          <div key={appointment._id} className="appointment-card">
            <div className="appointment-header">
              <h3>{appointment?.user?.fullName || 'Patient'}</h3>
              <span className={`status ${appointment.status}`}>{appointment.status}</span>
            </div>
            <div className="appointment-details">
              <p><strong>Doctor:</strong> {appointment?.doctor?.fullName || '-'}</p>
              <p><strong>Hospital:</strong> {appointment?.hospital?.name || '-'}</p>
              <p><strong>Date:</strong> {appointment.date}</p>
              <div style={{ marginTop: '0.5rem' }}>
                <label>Update Status: </label>
                <select defaultValue={appointment.status} onChange={(e) => updateAppointmentStatus(appointment._id, e.target.value)}>
                  <option value="booked">booked</option>
                  <option value="accepted">accepted</option>
                  <option value="rejected">rejected</option>
                  <option value="rescheduled">rescheduled</option>
                  <option value="completed">completed</option>
                </select>
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <label>Reschedule: </label>
                <input type="datetime-local" onChange={(e)=> appointment._newDate = e.target.value} />
                <button className="action-btn" onClick={()=> appointment._newDate && rescheduleAppointment(appointment._id, appointment._newDate)}>Apply</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:'0.75rem' }}>
        <span>Showing {apptPageItems.length} of {filteredAppointments.length} appointments</span>
        <div>
          <button className="action-btn" disabled={apptPage<=1} onClick={()=>setApptPage(p=>Math.max(1,p-1))}>Prev</button>
          <span style={{ margin:'0 0.5rem' }}>{apptPage} / {apptPageCount}</span>
          <button className="action-btn" disabled={apptPage>=apptPageCount} onClick={()=>setApptPage(p=>Math.min(apptPageCount,p+1))}>Next</button>
        </div>
      </div>
    </div>
  );

  const renderOperations = () => (
    <div className="operations-admin">
      <div className="section-header">
        <h2>Operations / Surgeries</h2>
      </div>
      <div className="profile-form" style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
        <input placeholder="Doctor ID" value={newOperation.doctor} onChange={(e)=>setNewOperation({ ...newOperation, doctor: e.target.value })} />
        <input placeholder="Patient ID" value={newOperation.patient} onChange={(e)=>setNewOperation({ ...newOperation, patient: e.target.value })} />
        <input type="date" placeholder="Date" value={newOperation.date} onChange={(e)=>setNewOperation({ ...newOperation, date: e.target.value })} />
        <input placeholder="Type" value={newOperation.type} onChange={(e)=>setNewOperation({ ...newOperation, type: e.target.value })} />
        <input placeholder="Outcome" value={newOperation.outcome} onChange={(e)=>setNewOperation({ ...newOperation, outcome: e.target.value })} />
        <input placeholder="Notes" value={newOperation.notes} onChange={(e)=>setNewOperation({ ...newOperation, notes: e.target.value })} />
        <button className="add-btn" onClick={createOperationAdmin}>+ Add Operation</button>
      </div>
      <div className="hospitals-table">
        <table>
          <thead>
            <tr>
              <th>Date</th><th>Type</th><th>Doctor</th><th>Patient</th><th>Outcome</th><th>Notes</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {operations.map(op => (
              <tr key={op._id}>
                <td><input defaultValue={op.date} onBlur={(e)=>{ op.date = e.target.value; }} /></td>
                <td><input defaultValue={op.type} onBlur={(e)=>{ op.type = e.target.value; }} /></td>
                <td>{op?.doctor?.fullName || op.doctor}</td>
                <td>{op?.patient?.fullName || op.patient}</td>
                <td><input defaultValue={op.outcome} onBlur={(e)=>{ op.outcome = e.target.value; }} /></td>
                <td><input defaultValue={op.notes} onBlur={(e)=>{ op.notes = e.target.value; }} /></td>
                <td>
                  <button className="action-btn edit" onClick={()=> updateOperationAdmin(op)}>Save</button>
                  <button className="action-btn delete" onClick={()=> deleteOperationAdmin(op._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderNotificationsAdmin = () => (
    <div className="notifications-admin">
      <div className="section-header">
        <h2>Notifications</h2>
      </div>
      <div className="profile-form" style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
        <input placeholder="Message" value={newNotification.message} onChange={(e)=>setNewNotification({ ...newNotification, message: e.target.value })} />
        <select value={newNotification.roleTarget} onChange={(e)=>setNewNotification({ ...newNotification, roleTarget: e.target.value })}>
          <option value="all">All</option>
          <option value="patient">Patients</option>
          <option value="doctor">Doctors</option>
          <option value="admin">Admins</option>
        </select>
        <button className="add-btn" onClick={createNotificationAdmin}>+ Add Notification</button>
      </div>
      <div className="hospitals-table">
        <table>
          <thead>
            <tr>
              <th>Message</th><th>Role</th><th>Created</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notificationsList.map(n => (
              <tr key={n._id}>
                <td>{n.message}</td>
                <td>{n.roleTarget || 'all'}</td>
                <td>{n.createdAt ? new Date(n.createdAt).toLocaleString() : '-'}</td>
                <td>
                  <button className="action-btn delete" onClick={()=> deleteNotificationAdmin(n._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReportsAnalytics = () => (
    <div className="reports-analytics">
      <h2>Reports & Analytics</h2>
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Appointment Trends</h3>
          <div className="chart-placeholder">
            <p>📊 Appointment trends chart will appear here</p>
          </div>
        </div>
        <div className="analytics-card">
          <h3>Hospital Usage</h3>
          <div className="chart-placeholder">
            <p>📈 Hospital usage statistics will appear here</p>
          </div>
        </div>
        <div className="analytics-card">
          <h3>Doctor Performance</h3>
          <div className="chart-placeholder">
            <p>📉 Doctor performance metrics will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboardOverview();
      case 'hospitals':
        return renderManageHospitals();
      case 'doctors':
        return renderManageDoctors();
      case 'calendar':
        return renderDoctorCalendar();
      case 'appointments':
        return renderAppointmentsOverview();
      case 'operations':
        return renderOperations();
      case 'notifications':
        return renderNotificationsAdmin();
      case 'reports':
        return renderReportsAnalytics();
      default:
        return renderDashboardOverview();
    }
  };

  return (
    <div className="admin-dashboard-layout">
      {/* Top Navigation */}
      <nav className="admin-top-nav">
        <div className="nav-left">
          <div className="logo">
            <Link to="/home">OP Care</Link>
          </div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search doctor/hospital..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn">🔍</button>
          </div>
        </div>
        <div className="nav-right">
          <div className="notifications">
            <button 
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              🔔
              <span className="notification-badge">3</span>
            </button>
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-item">
                  <p>New appointment request</p>
                  <span>2 min ago</span>
                </div>
                <div className="notification-item">
                  <p>Hospital registration pending</p>
                  <span>1 hour ago</span>
                </div>
                <div className="notification-item">
                  <p>Emergency slot booked</p>
                  <span>3 hours ago</span>
                </div>
              </div>
            )}
          </div>
          <div className="admin-profile">
            <button 
              className="profile-btn"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              👤 Admin
            </button>
            {showProfileDropdown && (
              <div className="profile-dropdown">
                <Link to="/profile">Profile</Link>
                <Link to="/settings">Settings</Link>
                <button>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="admin-main-content">
        {/* Sidebar Navigation */}
        <aside className="admin-sidebar">
          <ul>
            {sidebarItems.map(item => (
              <li key={item.id}>
                <button
                  className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content Area */}
        <main className="admin-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
