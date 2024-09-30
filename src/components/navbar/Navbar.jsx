import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";
import { FaSignOutAlt } from "react-icons/fa";
import "./navbar.css";

const handleLogout = async () => {
  try {
    await signOut(auth);
    cookies.remove("auth-token");
    setIsAuth(false);
    window.location.href = "/";
  } catch (error) {
    console.error("Error logging out:", error);
  }
};

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img
          src="../../../public/icon.png"
          alt="Hand Icon"
          className="hand-icon"
        />
        <span className="brand-name">SNAPSTUDY</span>
      </div>
      <div className="navbar-right" onClick={handleLogout}>
        <FaSignOutAlt className="logout-icon" />
      </div>
    </nav>
  );
};

export default Navbar;
