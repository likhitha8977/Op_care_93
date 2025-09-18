import React, { useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { Link, useNavigate } from "react-router-dom";

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("patient");
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      alert("Please fill all fields!");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, phone, role }),
        credentials: "include", // add this if you want cookies/session
      });

      const data = await res.json();
      if (res.ok) {
        alert("Signup successful! Please login.");
        navigate("/signin");
      } else {
        alert(data.error || "Signup failed");
      }
    } catch (err) {
      alert("Signup error: " + err.message);
    }
  };

  return (
    <>
      {/* Header removed, global Navbar used */}

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
              <h4>Create Account</h4>
            </div>

            <form id="signupForm" onSubmit={handleSignUp}>
              <p>Full Name</p>
              <input
                type="text"
                placeholder="Enter Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

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

              <p>Phone</p>
              <input
                type="text"
                placeholder="Enter Your Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <p>Role</p>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>

              <button className="signup-btn" type="submit">
                Sign-Up
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
                  Sign up with Google
                </button>
              </div>
              <p>
                Already have an account?{" "}
                <Link to="/signin" className="login">
                  Login
                </Link>
              </p>
            </center>
          </div>
        </div>
      </main>

      <footer>&copy; 2025 OPcare. All Rights Reserved.</footer>
    </>
  );
}
