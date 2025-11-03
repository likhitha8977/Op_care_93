import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "../styles/home.css";

function Home() {
  const { user } = useContext(UserContext);
  const targetPath = user
    ? user.role === "admin"
      ? "/admin-dashboard"
      : user.role === "doctor"
      ? "/doctor"
      : "/signin"
    : "/signin";
  return (
    <div className="home-page">
      {/* Header */}
      {/* Header removed, global Navbar used */}

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Smart OP Generation System</h1>
          <p>
            Say goodbye to long queues and manual hospital registrations. OPcare
            makes outpatient registration <b>fast, easy, and digital</b>.
          </p>
          <Link to={targetPath} className="btn">
            Get Started
          </Link>
        </div>
        <div className="hero-image">
          <img src="/docter.png" alt="Doctor" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose OPcare?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <img src="/hospital.jpeg" alt="Nearby Hospitals" />
            <h3>Locate Hospitals</h3>
            <p>Find and select hospitals near you with available OP slots.</p>
          </div>
          <div className="feature-card">
            <img src="/appaointment.png" alt="Appointments" />
            <h3>Book Appointments</h3>
            <p>Choose your doctor and secure your consultation instantly.</p>
          </div>
          <div className="feature-card">
            <img src="/payment.jpg" alt="Payments" />
            <h3>Secure Payments</h3>
            <p>Pay online for OP registrations safely and conveniently.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <p>&copy; 2025 OPcare. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
