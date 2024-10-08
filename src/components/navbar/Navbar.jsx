import React from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase";
import { FaSignOutAlt } from "react-icons/fa";
import Cookies from "universal-cookie";
import "./navbar.css";

const Navbar = () => {
  const cookies = new Cookies(); // Initialize cookies instance
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user from Firebase
      cookies.remove("auth-token", { path: "/" }); // Remove the auth-token cookie
      navigate("/"); // Redirect to the homepage after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="navbar">
      <a href="/home" className="navbar-left">
        <img src="/icon.png" alt="Hand Icon" className="hand-icon" />
        <span className="brand-name">SNAPSTUDY</span>
      </a>
      <div className="navbar-right" onClick={handleLogout}>
        <FaSignOutAlt className="logout-icon" />
      </div>
    </nav>
  );
};

export default Navbar;
