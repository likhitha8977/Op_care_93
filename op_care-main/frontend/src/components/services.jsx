import React from 'react';
import "../styles/services.css"; // Assuming you have a CSS file for styles
const Services = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Hospital Services</h1>
          <p className="mt-2 text-gray-300">
            Explore the broad range of services offered by modern hospitals.
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-semibold text-white mb-4">Main Service Categories</h2>
            <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
              <li><strong>Medical Services</strong>
                <ul className="list-disc ml-6">
                  <li>General Medicine</li>
                  <li>Emergency & Trauma Care</li>
                  <li>Intensive Care Unit (ICU), Neonatal ICU (NICU), Pediatric ICU (PICU)</li>
                  <li>Surgery (General Surgery, Laparoscopic, Transplants, etc.)</li>
                  <li>Specialized Departments (Cardiology, Neurology, Orthopedics, Gastroenterology, Pulmonology, etc.)</li>
                </ul>
              </li>
              <li><strong>Diagnostic & Laboratory Services</strong>
                <ul className="list-disc ml-6">
                  <li>Pathology (Blood, Urine, Tissue testing)</li>
                  <li>Radiology & Imaging (X-ray, CT scan, MRI, Ultrasound, Mammography)</li>
                  <li>Endoscopy, ECG, EEG, etc.</li>
                </ul>
              </li>
              <li><strong>Preventive & Outpatient Services</strong>
                <ul className="list-disc ml-6">
                  <li>Outpatient Department (OPD) consultations</li>
                  <li>Vaccination & Immunization</li>
                  <li>Health Check-ups / Preventive Screenings</li>
                </ul>
              </li>
              <li><strong>Supportive & Nursing Services</strong>
                <ul className="list-disc ml-6">
                  <li>Inpatient wards (General, Private, Semi-private)</li>
                  <li>Nursing care</li>
                  <li>Physiotherapy & Rehabilitation</li>
                  <li>Nutrition & Dietetics</li>
                </ul>
              </li>
              <li><strong>Emergency & Ambulance Services</strong>
                <ul className="list-disc ml-6">
                  <li>24/7 Ambulance support</li>
                  <li>Emergency surgery and first-aid</li>
                  <li>Disaster management services</li>
                </ul>
              </li>
              <li><strong>Pharmacy Services</strong>
                <ul className="list-disc ml-6">
                  <li>In-house pharmacy</li>
                  <li>Prescription management</li>
                </ul>
              </li>
              <li><strong>Administrative & Social Services</strong>
                <ul className="list-disc ml-6">
                  <li>Medical records & billing</li>
                  <li>Patient counseling & social services</li>
                  <li>Insurance and claim support</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
