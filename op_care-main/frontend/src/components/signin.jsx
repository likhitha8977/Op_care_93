import React, { useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { Link, useNavigate } from "react-router-dom";

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(UserContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Save user + token in context
        login({
          fullName: data.user.fullName,
          email: data.user.email,
          phone: data.user.phone,
          role: data.user.role,
          token: data.token,
        });

        alert(`Welcome back, ${data.user.fullName}!`);
        // Redirect by role
        if (data.user.role === "admin") {
          navigate("/admin-dashboard");
        } else if (data.user.role === "doctor") {
          navigate("/doctor");
        } else {
          navigate("/profile");
        }
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      alert("Login error: " + err.message);
    }
  };

  return (
    <>
      <main className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-image">
            <img src="/Pre-Op-Clearance.jpg" alt="Doctor" />
          </div>

          <div className="auth-form">
            <div className="imgLOGO">
              <img src="/logo.png" alt="logo" />
              <h1>
                <strong>
                  <i>Welcome To OPcare</i>
                </strong>
              </h1>
              <h4>Login</h4>
            </div>

            <form id="signinForm" onSubmit={handleLogin}>
              <p>Email</p>
              <input
                type="email"
                placeholder="Enter Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <p>Password</p>
              <input
                type="password"
                placeholder="Enter Your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button className="signup-btn" type="submit">
                Login
              </button>
            </form>

            <center>
              <p>-OR-</p>
              <div className="socialmedia">
                <button
                  type="button"
                  className="google-btn"
                  style={{
                    background: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    padding: "0.5rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                  onClick={() => (window.location.href = "/api/auth/google")}
                >
                  <img
                    src="/google.png"
                    alt="Google"
                    style={{ height: "24px" }}
                  />
                  Sign in with Google
                </button>
              </div>
              <p>
                Don’t have an account?{" "}
                <Link to="/signup" className="login">
                  Sign Up
                </Link>
              </p>
            </center>
          </div>
        </div>
      </main>

      <footer>
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>Email: support@healthcare.com</p>
          <p>Phone: +91 98765 43210</p>
          <p>Address: Hyderabad, India</p>
          <p>&copy; 2025 OPcare. All Rights Reserved.</p>
        </div>
      </footer>
    </>
  );
}
