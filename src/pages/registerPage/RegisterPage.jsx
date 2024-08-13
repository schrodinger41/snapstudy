import React, { useState } from "react";
import { auth, googleProvider } from "../../config/firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import GoogleLogo from "../../images/googlelogo.png";
import WebsiteLogo from "../../images/icon.png";
import "./registerPage.css";

const RegisterPage = () => {
  const [email, setEmail] = useState("");

  const signIn = async () => {
    // Your sign-in logic
    await createUserWithEmailAndPassword(auth, email);
  };

  const signInWithGoogle = async () => {
    // Your Google sign-in logic
    await signInWithPopup(auth, googleProvider);
  };

  return (
    <div className="register-page">
      <div className="left-container">
        <div className="logo">
          <img src={WebsiteLogo} alt="Website logo" className="logo-image" />
          <h2 className="logo-text">Snapstudy</h2>
        </div>

        <h1>Log in and start learning today</h1>
        <p>Just use your email or your Google account</p>
      </div>
      <div className="right-container">
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="sign-in-link-button" onClick={signIn}>
          Sign In
        </button>
        <p className="or-text">or</p>
        <button className="google-sign-in-button" onClick={signInWithGoogle}>
          <img src={GoogleLogo} alt="Google logo" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;
