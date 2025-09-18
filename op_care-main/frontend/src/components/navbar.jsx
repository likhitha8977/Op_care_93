import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import '../styles/global.css';

const Navbar = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <nav className="main-navbar">
      <ul>
        {!user ? (
          <>
            <li><Link to="/signin">Login</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
          </>
        ) : (
          <>
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/bookings">Bookings</Link></li>
            <li><Link to="/payment">Payment</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            <li><button className="logout-btn" onClick={() => { logout(); navigate('/signin'); }}>Logout</button></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
