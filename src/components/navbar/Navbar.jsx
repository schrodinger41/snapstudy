import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase";
import { FaUserCircle } from "react-icons/fa"; // User icon instead of logout icon
import Cookies from "universal-cookie";
import "./navbar.css";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false); // Manage dropdown state
  const cookies = new Cookies();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      cookies.remove("auth-token", { path: "/" });
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="navbar">
      <a href="/home" className="navbar-left">
        <img src="/icon.png" alt="Hand Icon" className="hand-icon" />
        <span className="brand-name">SNAPSTUDY</span>
      </a>
      <div className="navbar-right">
        <div className="user-icon-container" onClick={toggleDropdown}>
          <FaUserCircle className="user-icon" />
          {dropdownOpen && (
            <div className="dropdown-menu">
              <a href="/profilePage">Profile</a>
              <a href="/myCardsPage">Card Sets</a>
              <a href="/" onClick={handleLogout}>Logout</a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
