import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import SidenavDoctor from "./SidenavDoctor";
import "../../styles/profile.css";
import "../../styles/doctor.css";

const DoctorLayout = () => {
  // Toggle this to switch between static demo data vs API-backed
  const STATIC_MODE = false;
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Dashboard stats
  const [stats, setStats] = useState({
    patientsToday: 0,
    casesTotal: 0,
    operationsTotal: 0,
    upcomingAppointments: 0,
  });

  // Data stores
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [operations, setOperations] = useState([]);
  const [availability, setAvailability] = useState({ status: "Available", hours: "Mon–Fri, 10:00–14:00" });
  const [doctorProfile, setDoctorProfile] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    specialization: "",
    experience: "",
    qualifications: "",
    fees: "",
  });
  const [notifications, setNotifications] = useState([]);

  // Prescriptions
  const [prescriptions, setPrescriptions] = useState([]);
  const [newPrescription, setNewPrescription] = useState({ patient: "", medicines: [{ name: "", dosage: "", frequency: "", duration: "" }], notes: "" });
  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState([]);
  const [patientSearchLoading, setPatientSearchLoading] = useState(false);
  const [selectedPatientName, setSelectedPatientName] = useState("");

  // Reports
  const [reports, setReports] = useState({ patientsPerDay: [], operationsDone: 0, revenue: 0 });
  // Video availability
  const [videoAvailable, setVideoAvailable] = useState(false);
  const [videoHours, setVideoHours] = useState("");
  
  // Fetch live notifications (even in STATIC_MODE)
  const loadNotifications = async () => {
    try {
      if (!user?.token) return;
      const res = await fetch('/api/notifications', { headers: { 'Authorization': `Bearer ${user.token}` } });
      const data = await res.json();
      if (Array.isArray(data)) setNotifications(data);
    } catch (e) { console.error('Failed to load notifications', e); }
  };

  useEffect(() => {
    if (STATIC_MODE) {
      // Demo stats
      setStats({
        patientsToday: 6,
        casesTotal: 142,
        operationsTotal: 18,
        upcomingAppointments: 5,
      });
      // Demo appointments
      setAppointments([
        { _id: 'a1', date: new Date().toISOString(), status: 'booked', user: { fullName: 'John Doe' } },
        { _id: 'a2', date: new Date(Date.now()+86400000).toISOString(), status: 'accepted', user: { fullName: 'Priya Sharma' } },
        { _id: 'a3', date: new Date(Date.now()+2*86400000).toISOString(), status: 'booked', user: { fullName: 'Kumar R' } },
      ]);
      // Demo patients list
      setPatients([
        { _id: 'p1', name: 'John Doe', lastVisit: '2025-09-28' },
        { _id: 'p2', name: 'Priya Sharma', lastVisit: '2025-09-29' },
      ]);
      // Demo operations
      setOperations([
        { date: '2025-10-05', type: 'Appendectomy' },
        { date: '2025-10-12', type: 'Knee Arthroscopy' },
      ]);
      // Demo availability
      setAvailability({ status: 'Available', hours: 'Mon–Fri, 10:00–14:00' });
      // Demo profile
      setDoctorProfile(dp => ({
        ...dp,
        specialization: 'General Medicine',
        experience: '8',
        qualifications: 'MBBS, MD',
        fees: '500',
      }));
      // Demo prescriptions
      setPrescriptions([
        { _id: 'rx1', date: new Date().toISOString(), patient: { fullName: 'John Doe' }, medicines: [{ name: 'Paracetamol' }], notes: 'Take after food', attachments: [] },
        { _id: 'rx2', date: new Date(Date.now()-86400000).toISOString(), patient: { fullName: 'Priya Sharma' }, medicines: [{ name: 'Amoxicillin' }], notes: 'Twice daily', attachments: [] },
      ]);
      // Demo reports
      setReports({
        patientsPerDay: [
          { date: '2025-09-27', count: 2 },
          { date: '2025-09-28', count: 3 },
          { date: '2025-09-29', count: 1 },
          { date: '2025-09-30', count: 4 },
          { date: '2025-10-01', count: 3 },
          { date: '2025-10-02', count: 5 },
          { date: '2025-10-03', count: 6 },
        ],
        operationsDone: 18,
        revenue: 71000,
      });
      // Load live notifications from API so admin-posted messages appear for doctors
      loadNotifications();
      return;
    }

    // API-driven mode
    const token = user?.token;
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    const fetchAll = async () => {
      try {
        const [statsRes, apptRes, patientsRes, opsRes, availRes, profileRes, rxRes, repRes] = await Promise.all([
          fetch('/api/doctor/stats', { headers }).then(r => r.json()),
          fetch('/api/doctor/appointments?scope=today', { headers }).then(r => r.json()),
          fetch('/api/doctor/patients', { headers }).then(r => r.json()),
          fetch('/api/doctor/operations', { headers }).then(r => r.json()),
          fetch('/api/doctor/availability', { headers }).then(r => r.json()),
          fetch('/api/doctor/profile', { headers }).then(r => r.json()),
          fetch('/api/doctor/prescriptions', { headers }).then(r => r.json()),
          fetch('/api/doctor/reports', { headers }).then(r => r.json()),
        ]);
        setStats(statsRes || {});
        setAppointments(Array.isArray(apptRes) ? apptRes : []);
        setPatients(Array.isArray(patientsRes) ? patientsRes : []);
        setOperations(Array.isArray(opsRes) ? opsRes : []);
        setAvailability(availRes || { status: "Available", hours: "" });
        setDoctorProfile(dp => ({
          ...dp,
          fullName: profileRes?.fullName || dp.fullName,
          email: profileRes?.email || dp.email,
          phone: profileRes?.phone || dp.phone,
          specialization: profileRes?.doctorProfile?.specialization || "",
          experience: profileRes?.doctorProfile?.experience || "",
          qualifications: profileRes?.doctorProfile?.qualifications || "",
          fees: profileRes?.doctorProfile?.fees || "",
        }));
        setVideoAvailable(!!profileRes?.videoAvailable);
        setVideoHours(profileRes?.videoHours || "");
        setPrescriptions(Array.isArray(rxRes) ? rxRes : []);
        setReports(repRes || { patientsPerDay: [], operationsDone: 0, revenue: 0 });
        // Load notifications after other data
        await loadNotifications();
      } catch (e) {
        console.error('Doctor panel data load failed', e);
      }
    };
    fetchAll();
  }, [user]);

  // Helpers
  const authHeaders = () => ({ 'Authorization': `Bearer ${user?.token}`, 'Content-Type': 'application/json' });

  // Debounced patient search
  useEffect(() => {
    if (STATIC_MODE) return;
    const q = patientQuery.trim();
    if (q.length < 2) {
      setPatientResults([]);
      setPatientSearchLoading(false);
      return;
    }
    setPatientSearchLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/doctor/patients?q=${encodeURIComponent(q)}`, { headers: authHeaders() });
        const data = await res.json();
        if (Array.isArray(data)) setPatientResults(data);
      } catch (e) { console.error('Patient search failed', e); }
      finally { setPatientSearchLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [patientQuery]);

  // Availability update
  const saveAvailability = async () => {
    if (STATIC_MODE) { return; }
    try {
      if (!availability.status) { alert('Please select a status'); return; }
      const payload = { status: availability.status, hours: availability.hours };
      const res = await fetch('/api/doctor/availability', { method: 'PUT', headers: authHeaders(), body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { throw new Error(data?.error || 'Failed to save availability'); }
      setAvailability(data || payload);
      alert('Availability saved');
    } catch (e) { console.error('Failed to save availability', e); }
  };

  // Video availability update
  const saveVideoAvailability = async () => {
    try {
      const res = await fetch('/api/doctor/video/availability', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ available: videoAvailable, hours: videoHours })
      });
      const data = await res.json();
      if (!res.ok) { throw new Error(data?.error || 'Failed to save video availability'); }
      setVideoAvailable(!!data?.videoAvailable);
      setVideoHours(data?.videoHours || "");
      alert('Video availability saved');
    } catch (e) { console.error('Failed to save video availability', e); }
  };

  // Video actions per appointment
  const confirmVideo = async (id) => {
    try {
      const updated = await fetch(`/api/doctor/appointments/${id}/video/confirm`, { method: 'POST', headers: authHeaders() }).then(r=>r.json());
      setAppointments(prev => prev.map(a => a._id === id ? updated : a));
    } catch (e) { console.error('Confirm video failed', e); }
  };
  const startVideo = async (id) => {
    try {
      const updated = await fetch(`/api/doctor/appointments/${id}/video/start`, { method: 'POST', headers: authHeaders() }).then(r=>r.json());
      setAppointments(prev => prev.map(a => a._id === id ? updated : a));
    } catch (e) { console.error('Start video failed', e); }
  };
  const endVideo = async (id) => {
    try {
      const updated = await fetch(`/api/doctor/appointments/${id}/video/end`, { method: 'POST', headers: authHeaders() }).then(r=>r.json());
      setAppointments(prev => prev.map(a => a._id === id ? updated : a));
    } catch (e) { console.error('End video failed', e); }
  };

  // Appointment actions
  const completeAppointment = async (id) => {
    if (STATIC_MODE) { setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'completed' } : a)); return; }
    try {
      const res = await fetch(`/api/doctor/appointments/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status: 'completed' }) });
      const updated = await res.json();
      setAppointments(prev => prev.map(a => a._id === updated._id ? updated : a));
      fetch('/api/doctor/stats', { headers: authHeaders() }).then(r => r.json()).then(setStats);
    } catch (e) { console.error('Failed to complete appointment', e); }
  };

  const rescheduleAppointment = async (id, newDate) => {
    if (STATIC_MODE) { setAppointments(prev => prev.map(a => a._id === id ? { ...a, date: newDate, status: 'rescheduled' } : a)); return; }
    try {
      const res = await fetch(`/api/doctor/appointments/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ date: newDate, status: 'rescheduled' }) });
      const updated = await res.json();
      setAppointments(prev => prev.map(a => a._id === updated._id ? updated : a));
    } catch (e) { console.error('Failed to reschedule', e); }
  };

  // Profile save
  const saveProfile = async () => {
    if (STATIC_MODE) { return; }
    try {
      const payload = { phone: doctorProfile.phone, doctorProfile: {
        specialization: doctorProfile.specialization,
        experience: doctorProfile.experience,
        qualifications: doctorProfile.qualifications,
        fees: doctorProfile.fees,
      }};
      const res = await fetch('/api/doctor/profile', { method: 'PUT', headers: authHeaders(), body: JSON.stringify(payload) });
      const data = await res.json();
      setDoctorProfile(dp => ({ ...dp, phone: data.phone || dp.phone }));
    } catch (e) { console.error('Failed to save profile', e); }
  };

  // Prescriptions
  const addMedicineRow = () => {
    setNewPrescription(p => ({ ...p, medicines: [...p.medicines, { name: "", dosage: "", frequency: "", duration: "" }] }));
  };

  const updateMedicine = (idx, field, value) => {
    setNewPrescription(p => ({
      ...p,
      medicines: p.medicines.map((m, i) => i === idx ? { ...m, [field]: value } : m)
    }));
  };

  const createPrescription = async () => {
    if (!newPrescription.patient) {
      alert('Please select a patient from search before creating a prescription.');
      return;
    }
    if (STATIC_MODE) {
      const mock = { _id: `rx_${Date.now()}`, date: new Date().toISOString(), patient: patients.find(p=>p._id===newPrescription.patient) || { fullName: 'Patient' }, medicines: newPrescription.medicines, notes: newPrescription.notes, attachments: [] };
      setPrescriptions(prev => [mock, ...prev]);
      setNewPrescription({ patient: "", medicines: [{ name: "", dosage: "", frequency: "", duration: "" }], notes: "" });
      setSelectedPatientName("");
      return;
    }
    try {
      const res = await fetch('/api/doctor/prescriptions', { method: 'POST', headers: authHeaders(), body: JSON.stringify(newPrescription) });
      const data = await res.json();
      if (data?._id) {
        setPrescriptions(prev => [data, ...prev]);
        setNewPrescription({ patient: "", medicines: [{ name: "", dosage: "", frequency: "", duration: "" }], notes: "" });
        setSelectedPatientName("");
      }
    } catch (e) { console.error('Failed to create prescription', e); }
  };

  const updatePrescriptionNotes = async (id, notes) => {
    if (STATIC_MODE) { setPrescriptions(prev => prev.map(rx => rx._id === id ? { ...rx, notes } : rx)); return; }
    try {
      const res = await fetch(`/api/doctor/prescriptions/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ notes }) });
      const data = await res.json();
      setPrescriptions(prev => prev.map(rx => rx._id === id ? data : rx));
    } catch (e) { console.error('Failed to update prescription', e); }
  };

  const uploadAttachment = async (id, url) => {
    if (STATIC_MODE) { setPrescriptions(prev => prev.map(rx => rx._id === id ? { ...rx, attachments: [...(rx.attachments||[]), url] } : rx)); return; }
    try {
      const res = await fetch(`/api/doctor/prescriptions/${id}/attachments`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ url }) });
      const data = await res.json();
      setPrescriptions(prev => prev.map(rx => rx._id === id ? data : rx));
    } catch (e) { console.error('Failed to upload attachment', e); }
  };

  if (!user || user.role !== "doctor") {
    return (
      <div className="profile-container">
        <h2>Doctor Panel</h2>
        <p>Access denied or not logged in as doctor.</p>
      </div>
    );
  }

  return (
    <div className="profile-layout doctor-layout">
      <SidenavDoctor activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="profile-main doctor-main">
        <div className="doctor-topbar" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', padding: '0.75rem 1rem', borderBottom: '1px solid #eee', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <button className="book-btn" onClick={() => navigate('/home')}>Home</button>
          <button className="book-btn" onClick={() => setActiveTab('profile')}>Profile</button>
          <button className="cancel-btn" onClick={() => { logout(); navigate('/signin'); }}>Logout</button>
        </div>
        {activeTab === "dashboard" && (
          <div className="doctor-section">
            <h2>Dashboard Overview</h2>
            <ul>
              <li>Patients assigned today: <strong>{stats.patientsToday}</strong></li>
              <li>Cases treated so far: <strong>{stats.casesTotal}</strong></li>
              <li>Operations completed: <strong>{stats.operationsTotal}</strong></li>
              <li>Upcoming appointments: <strong>{stats.upcomingAppointments}</strong></li>
            </ul>
          </div>
        )}

        {activeTab === "appointments" && (
          <div className="doctor-section">
            <h2>Appointments Management</h2>
            <p>View today's and upcoming appointments. Reschedule / Complete.</p>
            <div className="buttons" style={{ marginBottom: '1rem' }}>
              <button className="book-btn" onClick={async () => {
                const list = await fetch('/api/doctor/appointments?scope=today', { headers: authHeaders() }).then(r => r.json());
                setAppointments(list);
              }}>Today</button>
              <button className="book-btn" onClick={async () => {
                const list = await fetch('/api/doctor/appointments?scope=upcoming', { headers: authHeaders() }).then(r => r.json());
                setAppointments(list);
              }}>Upcoming</button>
              <button className="book-btn" onClick={async () => {
                const list = await fetch('/api/doctor/appointments?scope=all', { headers: authHeaders() }).then(r => r.json());
                setAppointments(list);
              }}>All</button>
            </div>
            <ul>
              {appointments.length ? appointments.map((appt) => (
                <li key={appt._id}>
                  {new Date(appt.date).toLocaleString()} — {appt?.user?.fullName || appt.patientName || 'Patient'} — <em>{appt.status}</em>
                  {appt.consultationType === 'video' && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div><strong>Video:</strong> status <em>{appt.videoStatus || 'pending'}</em> {appt.videoLink && (<span> | Link: <a href={appt.videoLink} target="_blank" rel="noreferrer">Join</a></span>)}
                      </div>
                      <div className="buttons" style={{ marginTop: '0.25rem' }}>
                        <button className="book-btn" onClick={() => confirmVideo(appt._id)} disabled={appt.videoStatus === 'ready' || appt.videoStatus === 'started'}>Confirm Link</button>
                        <button className="book-btn" onClick={() => startVideo(appt._id)} disabled={appt.videoStatus !== 'ready'}>Start</button>
                        <button className="book-btn" onClick={() => endVideo(appt._id)} disabled={appt.videoStatus !== 'started'}>End</button>
                      </div>
                    </div>
                  )}
                  <div className="buttons">
                    <button className="book-btn" onClick={() => completeAppointment(appt._id)}>Mark Completed</button>
                    <input type="datetime-local" onChange={(e) => appt._newDate = e.target.value} />
                    <button className="book-btn" onClick={() => appt._newDate && rescheduleAppointment(appt._id, appt._newDate)}>Reschedule</button>
                  </div>
                </li>
              )) : <li>No appointments yet</li>}
            </ul>
          </div>
        )}

        {activeTab === "patients" && (
          <div className="doctor-section">
            <h2>Patients / Cases</h2>
            <p>View medical history, add notes, upload prescriptions and treatment plans.</p>
            <ul>
              {patients.length ? patients.map((p, idx) => (
                <li key={idx}>
                  {p.name} — {p.lastVisit}
                  <div className="buttons">
                    <button className="book-btn">View History</button>
                    <button className="book-btn">Add Notes</button>
                    <button className="book-btn">Upload Prescription</button>
                  </div>
                </li>
              )) : <li>No assigned patients yet</li>}
            </ul>
          </div>
        )}

        {activeTab === "prescriptions" && (
          <div className="doctor-section">
            <h2>Prescription Management</h2>
            <div className="profile-form">
              <label>Patient Search:
                <input
                  placeholder="Type at least 2 characters..."
                  value={patientQuery}
                  onChange={(e) => setPatientQuery(e.target.value)}
                />
              </label>
              {patientSearchLoading && <div>Searching...</div>}
              {!patientSearchLoading && patientQuery.trim().length >= 2 && patientResults.length === 0 && (
                <div>No matching patients found.</div>
              )}
              {!!patientResults.length && (
                <ul style={{ border: '1px solid #eee', padding: '0.5rem', maxHeight: 160, overflowY: 'auto', marginTop: 4 }}>
                  {patientResults.map(u => (
                    <li key={u._id} style={{ cursor: 'pointer', padding: '4px 2px' }}
                      onClick={() => {
                        setNewPrescription(p => ({ ...p, patient: u._id }));
                        setSelectedPatientName(u.fullName || u.name || u.email || 'Patient');
                        setPatientQuery('');
                        setPatientResults([]);
                      }}
                    >
                      {(u.fullName || u.name) ? `${u.fullName || u.name} (${u.email || ''})` : (u.email || u._id)}
                    </li>
                  ))}
                </ul>
              )}
              <div>
                <strong>Selected Patient:</strong> {selectedPatientName || (patients.find(p=>p._id===newPrescription.patient)?.fullName || '') || 'None'}
              </div>
              <label>Notes:
                <input value={newPrescription.notes} onChange={(e) => setNewPrescription(p => ({ ...p, notes: e.target.value }))} />
              </label>
              <div>
                <strong>Medicines</strong>
                {newPrescription.medicines.map((m, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input placeholder="Name" value={m.name} onChange={(e) => updateMedicine(idx, 'name', e.target.value)} />
                    <input placeholder="Dosage" value={m.dosage} onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)} />
                    <input placeholder="Frequency" value={m.frequency} onChange={(e) => updateMedicine(idx, 'frequency', e.target.value)} />
                    <input placeholder="Duration" value={m.duration} onChange={(e) => updateMedicine(idx, 'duration', e.target.value)} />
                  </div>
                ))}
                <button className="book-btn" onClick={addMedicineRow}>+ Add Medicine</button>
              </div>
              <div className="buttons">
                <button className="book-btn" onClick={createPrescription}>Create & Send</button>
              </div>
            </div>
            <h3>Previous Prescriptions</h3>
            <ul>
              {prescriptions.length ? prescriptions.map(rx => (
                <li key={rx._id}>
                  {new Date(rx.date).toLocaleString()} — {(rx.patient && (rx.patient.fullName || rx.patient.name)) || ''}
                  <div>
                    <em>{rx.medicines?.map(m => m.name).filter(Boolean).join(', ')}</em>
                  </div>
                  <div className="profile-form">
                    <label>Edit Notes:
                      <input defaultValue={rx.notes} onBlur={(e) => updatePrescriptionNotes(rx._id, e.target.value)} />
                    </label>
                    <label>Upload Test Result (URL):
                      <input placeholder="https://..." onKeyDown={(e) => { if (e.key === 'Enter') { uploadAttachment(rx._id, e.currentTarget.value); e.currentTarget.value=''; } }} />
                    </label>
                  </div>
                </li>
              )) : <li>No prescriptions yet.</li>}
            </ul>
          </div>
        )}

        {activeTab === "operations" && (
          <div className="doctor-section">
            <h2>Operations / Surgeries</h2>
            <p>Track upcoming surgeries and record details.</p>
            <ul>
              {operations.length ? operations.map((op, idx) => (
                <li key={idx}>
                  {op.date} — {op.type}
                  <div className="buttons">
                    <button className="book-btn">Record Outcome</button>
                  </div>
                </li>
              )) : <li>No operations scheduled.</li>}
            </ul>
          </div>
        )}

        {activeTab === "availability" && (
          <div className="doctor-section">
            <h2>Availability</h2>
            <div className="profile-form">
              <label>Status:
                <select value={availability.status} onChange={(e) => setAvailability({ ...availability, status: e.target.value })}>
                  <option>Available</option>
                  <option>Busy</option>
                  <option>On Leave</option>
                </select>
              </label>
              <label>Visiting Hours:
                <input value={availability.hours} onChange={(e) => setAvailability({ ...availability, hours: e.target.value })} />
              </label>
            </div>
            <p>Patients will only be able to book during available hours.</p>
            <div className="buttons">
              <button className="book-btn" onClick={saveAvailability}>Save Availability</button>
            </div>

            <h3 style={{ marginTop: '1.5rem' }}>Video Consultation Availability</h3>
            <div className="profile-form">
              <label>
                Available for Video:
                <input type="checkbox" checked={videoAvailable} onChange={(e)=> setVideoAvailable(e.target.checked)} />
              </label>
              <label>
                Video Hours:
                <input value={videoHours} onChange={(e)=> setVideoHours(e.target.value)} placeholder="e.g., Mon–Fri, 16:00–18:00" />
              </label>
            </div>
            <div className="buttons">
              <button className="book-btn" onClick={saveVideoAvailability}>Save Video Availability</button>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="profile-details doctor-section">
            <h2>Profile & Credentials</h2>
            <div className="profile-form">
              <label>Full Name:
                <input value={doctorProfile.fullName} onChange={(e) => setDoctorProfile({ ...doctorProfile, fullName: e.target.value })} />
              </label>
              <label>Email:
                <input value={doctorProfile.email} onChange={(e) => setDoctorProfile({ ...doctorProfile, email: e.target.value })} />
              </label>
              <label>Phone:
                <input value={doctorProfile.phone} onChange={(e) => setDoctorProfile({ ...doctorProfile, phone: e.target.value })} />
              </label>
              <label>Specialization:
                <input value={doctorProfile.specialization} onChange={(e) => setDoctorProfile({ ...doctorProfile, specialization: e.target.value })} />
              </label>
              <label>Experience (years):
                <input value={doctorProfile.experience} onChange={(e) => setDoctorProfile({ ...doctorProfile, experience: e.target.value })} />
              </label>
              <label>Qualifications:
                <input value={doctorProfile.qualifications} onChange={(e) => setDoctorProfile({ ...doctorProfile, qualifications: e.target.value })} />
              </label>
              <label>Consultation Fees:
                <input value={doctorProfile.fees} onChange={(e) => setDoctorProfile({ ...doctorProfile, fees: e.target.value })} />
              </label>
              <div className="buttons">
                <button className="book-btn" onClick={saveProfile}>Save</button>
                <button className="cancel-btn">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="doctor-section">
            <h2>Notifications & Alerts</h2>
            <ul>
              {notifications.length ? notifications.map((n, idx) => (
                <li key={idx}>{n.message}</li>
              )) : <li>No notifications yet.</li>}
            </ul>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="doctor-section">
            <h2>Reports & Analytics</h2>
            <div>
              <h3>Patients per day (last 7 days)</h3>
              <ul>
                {reports.patientsPerDay?.length ? reports.patientsPerDay.map((d) => (
                  <li key={d.date}>{d.date}: {d.count}</li>
                )) : <li>No data</li>}
              </ul>
              <p><strong>Operations done:</strong> {reports.operationsDone}</p>
              <p><strong>Revenue generated:</strong> ₹{reports.revenue}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorLayout;
