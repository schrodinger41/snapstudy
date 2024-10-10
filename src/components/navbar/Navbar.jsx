// components/navbar/Navbar.js
import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../config/firebase"; // Ensure you import db
import { FaUserCircle } from "react-icons/fa"; // User icon
import Cookies from "universal-cookie";
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions
import "./navbar.css";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false); // Manage dropdown state
  const [role, setRole] = useState(null); // State to store user role
  const cookies = new Cookies();
  const navigate = useNavigate();

  // Fetch user role when the component mounts
  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "Users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setRole(userDoc.data().role); // Set user role from Firestore
        }
      }
    };
    fetchUserRole();
  }, []);

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
      {role === "user" && (
        <>
          <a href="/home" className="navbar-left">
            <img src="/icon.png" alt="Hand Icon" className="hand-icon" />
            <span className="brand-name">SNAPSTUDY</span>
          </a>
        </>
      )}
      {role === "admin" && (
        <>
          <a href="/adminPage" className="navbar-left">
            <img src="/icon.png" alt="Hand Icon" className="hand-icon" />
            <span className="brand-name">SNAPSTUDY</span>
          </a>
        </>
      )}

      <div className="navbar-right">
        <div className="user-icon-container" onClick={toggleDropdown}>
          <FaUserCircle className="user-icon" />
          {dropdownOpen && (
            <div className="dropdown-menu">
              {role === "user" && (
                <>
                  <a href="/profilePage">Profile</a>
                  <a href="/myCardsPage">Card Sets</a>
                </>
              )}
              <a href="/" onClick={handleLogout}>
                Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
