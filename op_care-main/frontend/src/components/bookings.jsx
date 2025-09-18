import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Accept notification setter as prop
import '../styles/bookings.css';

const hospitalTypes = [
  'Government',
  'Private',
  'Teaching',
  'Multi-specialty',
  'Super-specialty',
  'Community',
  'Central Institute',
  'Non-profit',
  'Chain',
];

const hospitals = [
  // Andhra Pradesh
  {
    name: 'AIIMS Mangalagiri',
    type: 'Central Institute',
    image: '/hospital.jpeg',
    city: 'Mangalagiri',
    details: 'Central-government AIIMS level institute (~960 beds), offers General Medicine & Surgery, Pediatrics, Radiology, Pathology, Emergency, with teaching & research role.',
    facilities: [
      'General Medicine', 'General Surgery', 'Pediatrics', 'Radiology', 'Pathology', 'Emergency', 'Teaching', 'Research'
    ],
    services: [
      'General Medicine', 'Surgery', 'Pediatrics', 'Radiology', 'Pathology', 'Emergency Care'
    ]
  },
  {
    name: 'SVIMS, Tirupati',
    type: 'Super-specialty University Hospital',
    image: '/hospital.webp',
    city: 'Tirupati',
    details: 'Super-specialty university hospital (~1,000 beds) offering Cardiology, Oncology, Neurology, Nephrology, Urology, Cardiothoracic Surgery.',
    facilities: [
      'Cardiology', 'Oncology', 'Neurology', 'Nephrology', 'Urology', 'Cardiothoracic Surgery'
    ],
    services: [
      'Cardiology', 'Oncology', 'Neurology', 'Nephrology', 'Urology', 'Cardiothoracic Surgery'
    ]
  },
  {
    name: 'Aster Ramesh Hospitals, Guntur',
    type: 'Private Multi-specialty',
    image: '/hospital.jpeg',
    city: 'Guntur',
    details: 'Private multispecialty (~350 beds), services include Cardiology & Cardiac Surgery, Neurology & Neurosurgery, Orthopedics, Emergency & Trauma, Nephrology, Gastroenterology, Critical Care.',
    facilities: [
      'Cardiology', 'Cardiac Surgery', 'Neurology', 'Neurosurgery', 'Orthopedics', 'Emergency', 'Trauma', 'Nephrology', 'Gastroenterology', 'Critical Care'
    ],
    services: [
      'Cardiology', 'Cardiac Surgery', 'Neurology', 'Neurosurgery', 'Orthopedics', 'Emergency', 'Trauma', 'Nephrology', 'Gastroenterology', 'Critical Care'
    ]
  },
  {
    name: 'Sri Sathya Sai Institute of Higher Medical Sciences, Puttaparthi',
    type: 'Free Hospital',
    image: '/images.jpeg',
    city: 'Puttaparthi',
    details: 'Free-of-cost hospital (~350 beds) offering Cardiac Surgery, Neurology, Ophthalmology, Urology, Radiology, General Surgery.',
    facilities: [
      'Cardiac Surgery', 'Neurology', 'Ophthalmology', 'Urology', 'Radiology', 'General Surgery'
    ],
    services: [
      'Cardiac Surgery', 'Neurology', 'Ophthalmology', 'Urology', 'Radiology', 'General Surgery'
    ]
  },
  {
    name: 'Queen’s NRI Hospital, Visakhapatnam',
    type: 'Private Multi-specialty',
    image: '/hospital.webp',
    city: 'Visakhapatnam',
    details: 'Multi-specialty (~200+ beds), services include Internal Medicine, Cardiology, Neurology, ENT, Pulmonology, General Surgery.',
    facilities: [
      'Internal Medicine', 'Cardiology', 'Neurology', 'ENT', 'Pulmonology', 'General Surgery'
    ],
    services: [
      'Internal Medicine', 'Cardiology', 'Neurology', 'ENT', 'Pulmonology', 'General Surgery'
    ]
  },
  {
    name: 'Trinity Hospital, Kakinada',
    type: 'Cancer & Critical Care',
    image: '/hospital.jpeg',
    city: 'Kakinada',
    details: 'Cancer care, Cardiology, ICU, General Medicine, Diabetology (~150 beds).',
    facilities: [
      'Cancer Care', 'Cardiology', 'ICU', 'General Medicine', 'Diabetology'
    ],
    services: [
      'Cancer Care', 'Cardiology', 'ICU', 'General Medicine', 'Diabetology'
    ]
  },
  // Telangana
  {
    name: 'Yashoda Hospitals',
    type: 'Private Chain',
    image: '/hospital.jpeg',
    city: 'Hyderabad',
    details: 'Private chain (Hyderabad) NABH/NABL accredited (~4,000 beds across branches); offers Neurology & Neurosurgery, Oncology, Cardiology & Cardiothoracic Surgery, Organ Transplant, Orthopaedics, Gynaecology, Neonatology, Paediatric surgery, ENT, Dermatology & Cosmetic surgery, Radiology & Imaging, Liver Transplant, Robotic Surgery, Bariatric Surgery.',
    facilities: [
      'Neurology', 'Neurosurgery', 'Oncology', 'Cardiology', 'Cardiothoracic Surgery', 'Organ Transplant', 'Orthopaedics', 'Gynaecology', 'Neonatology', 'Paediatric Surgery', 'ENT', 'Dermatology', 'Cosmetic Surgery', 'Radiology', 'Imaging', 'Liver Transplant', 'Robotic Surgery', 'Bariatric Surgery'
    ],
    services: [
      'Neurology', 'Oncology', 'Cardiology', 'Transplant', 'Orthopaedics', 'Gynaecology', 'Neonatology', 'Paediatric Surgery', 'ENT', 'Dermatology', 'Radiology', 'Liver Transplant', 'Robotic Surgery', 'Bariatric Surgery'
    ]
  },
  {
    name: 'Rainbow Hospitals',
    type: 'Pediatric & Maternal Care Chain',
    image: '/hospital.webp',
    city: 'Hyderabad',
    details: 'Pediatric & maternal care chain (Hyderabad-based, ≈19 hospitals & 3 clinics), services in Paediatric care, Neonatal care, Maternity, Women’s health, Fertility & Outpatient.',
    facilities: [
      'Paediatric Care', 'Neonatal Care', 'Maternity', 'Women’s Health', 'Fertility', 'Outpatient'
    ],
    services: [
      'Paediatric Care', 'Neonatal Care', 'Maternity', 'Women’s Health', 'Fertility', 'Outpatient'
    ]
  },
  {
    name: 'Basavatarakam Indo American Cancer Hospital & Research Institute',
    type: 'Non-profit Cancer Hospital',
    image: '/images.jpeg',
    city: 'Hyderabad',
    details: 'Non-profit tertiary cancer hospital & research centre in Hyderabad, offers Medical, Surgical, Radiation, Paediatric Oncology; research & training.',
    facilities: [
      'Medical Oncology', 'Surgical Oncology', 'Radiation Oncology', 'Paediatric Oncology', 'Research', 'Training'
    ],
    services: [
      'Medical Oncology', 'Surgical Oncology', 'Radiation Oncology', 'Paediatric Oncology'
    ]
  },
  {
    name: 'Osmania General Hospital',
    type: 'Government Multispecialty',
    image: '/hospital.jpeg',
    city: 'Hyderabad',
    details: 'Government multispecialty hospital (~1,168 beds), offers General Medicine, Surgery, Orthopedics, Cardiology, with emergency; heritage building.',
    facilities: [
      'General Medicine', 'Surgery', 'Orthopedics', 'Cardiology', 'Emergency'
    ],
    services: [
      'General Medicine', 'Surgery', 'Orthopedics', 'Cardiology', 'Emergency'
    ]
  },
  {
    name: 'NIMS Hyderabad',
    type: 'Premier Govt Tertiary Hospital',
    image: '/hospital.jpeg',
    city: 'Hyderabad',
    details: 'Premier govt multispecialty tertiary hospital (~1,500 beds), offers Cardiology, Neurology, Orthopedics, Urology, priority care for govt-referred patients, transplants including >100 kidney transplants this year.',
    facilities: [
      'Cardiology', 'Neurology', 'Orthopedics', 'Urology', 'Transplants', 'Emergency'
    ],
    services: [
      'Cardiology', 'Neurology', 'Orthopedics', 'Urology', 'Transplants', 'Emergency'
    ]
  },
  {
    name: 'Niloufer Hospital',
    type: 'Women & Children’s Hospital',
    image: '/hospital.webp',
    city: 'Hyderabad',
    details: 'Tertiary women & children’s hospital (~1,200 beds), offers Obstetrics, Gynecology, Pediatrics, Neonatology, emergency, maternity and NICU.',
    facilities: [
      'Obstetrics', 'Gynecology', 'Pediatrics', 'Neonatology', 'Emergency', 'Maternity', 'NICU'
    ],
    services: [
      'Obstetrics', 'Gynecology', 'Pediatrics', 'Neonatology', 'Emergency', 'Maternity', 'NICU'
    ]
  },
  {
    name: 'Sarojini Devi Eye Hospital',
    type: 'Government Ophthalmology',
    image: '/images.jpeg',
    city: 'Hyderabad',
    details: 'Government ophthalmology hospital (~550 beds), offers cataract, glaucoma, retina, cornea, pediatric ophthalmology, low-vision aid, emergency, optometry, outreach.',
    facilities: [
      'Cataract', 'Glaucoma', 'Retina', 'Cornea', 'Pediatric Ophthalmology', 'Low-vision Aid', 'Emergency', 'Optometry', 'Outreach'
    ],
    services: [
      'Cataract', 'Glaucoma', 'Retina', 'Cornea', 'Pediatric Ophthalmology', 'Low-vision Aid', 'Emergency', 'Optometry', 'Outreach'
    ]
  },
  {
    name: 'Apollo Hospitals, Hyderabad',
    type: 'Private Multi-specialty',
    image: '/hospital.jpeg',
    city: 'Hyderabad',
    details: 'Private multi-specialty; services include Orthopedics, Nephrology & Urology, Bariatric Surgery, Cardiology, Gastroenterology, Spine Surgery, Cancer/Oncology, Neurology & Neurosurgery, Transplants, Robotic Surgery, Preventive & Emergency care.',
    facilities: [
      'Orthopedics', 'Nephrology', 'Urology', 'Bariatric Surgery', 'Cardiology', 'Gastroenterology', 'Spine Surgery', 'Oncology', 'Neurology', 'Neurosurgery', 'Transplants', 'Robotic Surgery', 'Preventive Care', 'Emergency Care'
    ],
    services: [
      'Orthopedics', 'Nephrology', 'Urology', 'Bariatric Surgery', 'Cardiology', 'Gastroenterology', 'Spine Surgery', 'Oncology', 'Neurology', 'Neurosurgery', 'Transplants', 'Robotic Surgery', 'Preventive Care', 'Emergency Care'
    ]
  },
  {
    name: 'Gleneagles Global Hospitals',
    type: 'Tertiary Super-specialty',
    image: '/hospital.webp',
    city: 'Hyderabad',
    details: 'Offers ~40 specialties including oncology, multi-organ transplants, minimally invasive surgery, advanced ICU, robotic operation theaters, along with academic programs.',
    facilities: [
      'Oncology', 'Transplants', 'Minimally Invasive Surgery', 'ICU', 'Robotic Operation Theater', 'Academic Programs'
    ],
    services: [
      'Oncology', 'Transplants', 'Minimally Invasive Surgery', 'ICU', 'Robotic Operation Theater', 'Academic Programs'
    ]
  },
  {
    name: 'Care Hospitals, Hyderabad',
    type: 'Cardiac & Neuro Focus',
    image: '/hospital.webp',
    city: 'Hyderabad',
    details: 'Focused on neurosciences, cardiac sciences, as well as services in nephrology, oncology, orthopedics, emergency medicine.',
    facilities: [
      'Neurosciences', 'Cardiac Sciences', 'Nephrology', 'Oncology', 'Orthopedics', 'Emergency Medicine'
    ],
    services: [
      'Neurosciences', 'Cardiac Sciences', 'Nephrology', 'Oncology', 'Orthopedics', 'Emergency Medicine'
    ]
  },
  {
    name: 'Continental Hospitals',
    type: 'Superspecialty Private',
    image: '/hospital.jpeg',
    city: 'Hyderabad',
    details: 'Large private superspecialty facility (~750 beds + 43 ICU beds), covering wide-ranging care in cardiology, critical care, dentistry, dermatology, diabetology, dietetics, emergency, endocrinology, ENT, gastroenterology, general & laparoscopic surgery, general medicine.',
    facilities: [
      'Cardiology', 'Critical Care', 'Dentistry', 'Dermatology', 'Diabetology', 'Dietetics', 'Emergency', 'Endocrinology', 'ENT', 'Gastroenterology', 'General Surgery', 'Laparoscopic Surgery', 'General Medicine'
    ],
    services: [
      'Cardiology', 'Critical Care', 'Dentistry', 'Dermatology', 'Diabetology', 'Dietetics', 'Emergency', 'Endocrinology', 'ENT', 'Gastroenterology', 'General Surgery', 'Laparoscopic Surgery', 'General Medicine'
    ]
  },
];

const Bookings = ({ setNotification }) => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [formData, setFormData] = useState({ name: '', age: '', service: '', date: '' });
  const [submitted, setSubmitted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [detailsHospital, setDetailsHospital] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("");
  const [filterRating, setFilterRating] = useState("");

  const handleBookClick = (hospital) => {
    setSelectedHospital(hospital);
    setShowForm(true);
    setFormData({ name: '', age: '', service: '', date: '' });
    setSubmitted(false);
  };

  const handleViewDetails = (hospital) => {
    setDetailsHospital(hospital);
    setShowDetails(true);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setShowForm(false);
    // Save booking to backend
    const booking = {
      hospital: selectedHospital?._id || selectedHospital?.name,
      service: formData.service,
      date: formData.date,
      name: formData.name,
      age: formData.age
    };
    // Get token from localStorage
    const storedUser = JSON.parse(localStorage.getItem('opcare_user'));
    const token = storedUser?.token;
    fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(booking)
    })
      .then(res => res.json())
      .then(data => {
        if (setNotification) {
          setNotification(`Booking submitted for ${selectedHospital?.name} on ${formData.date}`);
        }
        // Auto-navigate to MyAppointments after booking
        navigate('/myappointments');
      })
      .catch(err => {
        if (setNotification) setNotification("Booking failed: " + err.message);
      });
  };

  // Filter hospitals by search
  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(search.toLowerCase()) || hospital.city.toLowerCase().includes(search.toLowerCase());
    const matchesCity = filterCity ? hospital.city === filterCity : true;
    const matchesType = filterType ? hospital.type === filterType : true;
    const matchesSpecialty = filterSpecialty ? hospital.services.includes(filterSpecialty) : true;
    // For demo, assume all ratings are 4 or 5
    const matchesRating = filterRating ? (filterRating === '5' ? true : true) : true;
    return matchesSearch && matchesCity && matchesType && matchesSpecialty && matchesRating;
  });

  return (
    <div className="bookings-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Hospitals in Andhra Pradesh & Telangana</h2>
        <button
          className="book-btn"
          style={{ minWidth: '160px', fontWeight: '600', fontSize: '1rem' }}
          onClick={() => navigate('/myappointments')}
        >
          My Appointments
        </button>
      </div>
      <input
        type="text"
        className="hospital-search"
        placeholder="Search hospital by name or city..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{marginBottom:'1rem'}}
      />
      <div style={{display:'flex',gap:'1rem',marginBottom:'1rem',flexWrap:'wrap'}}>
        <select value={filterCity} onChange={e=>setFilterCity(e.target.value)}>
          <option value="">All Cities</option>
          {[...new Set(hospitals.map(h=>h.city))].map(city=>(<option key={city} value={city}>{city}</option>))}
        </select>
        <select value={filterType} onChange={e=>setFilterType(e.target.value)}>
          <option value="">All Types</option>
          {hospitalTypes.map(type=>(<option key={type} value={type}>{type}</option>))}
        </select>
        <select value={filterSpecialty} onChange={e=>setFilterSpecialty(e.target.value)}>
          <option value="">All Specialties</option>
          {[...new Set(hospitals.flatMap(h=>h.services))].map(s=>(<option key={s} value={s}>{s}</option>))}
        </select>
        <select value={filterRating} onChange={e=>setFilterRating(e.target.value)}>
          <option value="">All Ratings</option>
          <option value="5">5 Star</option>
          <option value="4">4 Star</option>
        </select>
      </div>
      <div className="hospital-types">
        <strong>Types:</strong> {hospitalTypes.join(', ')}
        <div style={{ marginTop: '0.5rem', color: '#888', fontSize: '0.95rem' }}>
          Total Hospitals Listed: {filteredHospitals.length}
        </div>
      </div>
      <div className="hospitals-list">
        {filteredHospitals.map((hospital, idx) => (
          <div className="hospital-card" key={idx}>
            <img src={hospital.image} alt={hospital.name} className="hospital-img" />
            <div className="hospital-info">
              <h3>{hospital.name}</h3>
              <p><strong>Type:</strong> {hospital.type}</p>
              <p><strong>City:</strong> {hospital.city}</p>
              <p>{hospital.details}</p>
              <button className="view-btn" onClick={() => handleViewDetails(hospital)}>View Full Details</button>
              <button className="book-btn" onClick={() => handleBookClick(hospital)}>Book OP</button>
            </div>
          </div>
        ))}
      </div>

      {/* Full Details Modal */}
      {showDetails && detailsHospital && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{detailsHospital.name}</h3>
            <p><strong>Type:</strong> {detailsHospital.type}</p>
            <p><strong>City:</strong> {detailsHospital.city}</p>
            <p>{detailsHospital.details}</p>
            <div style={{ marginTop: '1rem' }}>
              <strong>Facilities Provided:</strong>
              <ul style={{ marginTop: '0.5rem' }}>
                {detailsHospital.facilities.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
            <button className="cancel-btn" style={{ marginTop: '1rem' }} onClick={() => setShowDetails(false)}>Close</button>
          </div>
        </div>
      )}

      {/* OP Booking Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Book OP at {selectedHospital?.name}</h3>
            <form onSubmit={handleFormSubmit} className="op-form">
              <label>
                Name:
                <input type="text" name="name" value={formData.name} onChange={handleFormChange} required />
              </label>
              <label>
                Age:
                <input type="number" name="age" value={formData.age} onChange={handleFormChange} required />
              </label>
              <label>
                Service:
                <select name="service" value={formData.service} onChange={handleFormChange} required>
                  <option value="">Select Service</option>
                  {selectedHospital?.services.map((srv, idx) => (
                    <option key={idx} value={srv}>{srv}</option>
                  ))}
                </select>
              </label>
              <label>
                Date:
                <input type="date" name="date" value={formData.date} onChange={handleFormChange} required />
              </label>
              <div className="form-actions">
                <button type="submit" className="book-btn">Submit</button>
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {submitted && (
        <div className="success-message">
          <strong>Booking submitted for {selectedHospital?.name}!</strong>
        </div>
      )}
    </div>
  );
};

export default Bookings;
