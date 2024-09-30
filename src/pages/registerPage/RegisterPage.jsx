import React, { useState } from "react";
import { auth, googleProvider } from "../../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import GoogleLogo from "../../images/googlelogo.png";
import WebsiteLogo from "../../images/icon.png";
import "./registerPage.css";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/invalid-email":
        return "Invalid email address.";
      case "auth/user-disabled":
        return "User account has been disabled.";
      case "auth/user-not-found":
        return "No user found with this email.";
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/email-already-in-use":
        return "Email is already in use.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      default:
        return "The account may not exist, or the credentials might be incorrect.";
    }
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    if (password.length > 20) {
      return "Password must be no longer than 20 characters.";
    }
    return null;
  };

  const handleAuth = async () => {
    if (!email || !password || (isRegistering && !confirmPassword)) {
      setError("Please fill in all fields.");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      if (isRegistering) {
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setError(""); // Clear any previous errors
      window.location.assign("/"); // Redirect after success
    } catch (error) {
      setError(getErrorMessage(error.code));
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      window.location.assign("/"); // Redirect after Google sign-in
    } catch (error) {
      setError(getErrorMessage(error.code));
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleAuth();
    }
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
        <div className="login-form-container">
          <h1 className="app-logo">
            {isRegistering ? "Sign Up!" : "Sign In!"}
          </h1>
          {error && <p className="error-message">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          {isRegistering && (
            <input
              type="password"
              placeholder="Confirm Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          )}
          <button className="sign-in-link-button" onClick={handleAuth}>
            {isRegistering ? "Sign Up" : "Sign In"}
          </button>
          <p className="or-text">or</p>
          <button className="google-sign-in-button" onClick={signInWithGoogle}>
            <img src={GoogleLogo} alt="Google logo" />
            {isRegistering ? "Sign Up" : "Sign In"} with Google
          </button>
          <div className="signup-text">
            {isRegistering
              ? "Already have an account?"
              : "Don't have an account?"}{" "}
            <a
              className="link-transfer-mode"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? "Sign In" : "Sign Up"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
