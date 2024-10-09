import React, { useState } from "react";
import { auth, googleProvider, db } from "../../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { setDoc, doc, getDoc } from "firebase/firestore";
import Cookies from "universal-cookie"; // Import Cookies from universal-cookie
import GoogleLogo from "../../images/googlelogo.png";
import RegisterImage from "../../images/registerImage.png";
import "./registerPage.css";

// Initialize cookie object
const cookies = new Cookies();

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fname, setFname] = useState("");
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
    if (
      !email ||
      !password ||
      (isRegistering && (!confirmPassword || !fname))
    ) {
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
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Save user data to Firestore and assign the default role of "user"
        await updateProfile(user, { displayName: fname });
        const userRef = doc(db, "Users", user.uid);
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          fullName: fname,
          role: "user", // Default role is "user"
        });

        // Set the auth-token in cookies
        cookies.set("auth-token", user.accessToken, { path: "/" });

        window.location.assign("/home");
      } else {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Fetch user role from Firestore
        const userRef = doc(db, "Users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const { role } = userDoc.data();
          // Set the auth-token in cookies
          cookies.set("auth-token", user.accessToken, { path: "/" });

          if (role === "admin") {
            window.location.assign("/adminPage");
          } else {
            window.location.assign("/home");
          }
        }
      }
    } catch (error) {
      setError(getErrorMessage(error.code));
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user exists in Firestore, if not, add with role "user"
      const userRef = doc(db, "Users", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          fullName: user.displayName || "Anonymous",
          role: "user", // Assign default role for Google sign-ins
        });
      }

      const { role } = userDoc.data() || { role: "user" }; // Default to "user" if new user

      // Set the auth-token in cookies
      cookies.set("auth-token", user.accessToken, { path: "/" });

      if (role === "admin") {
        window.location.assign("/adminPage");
      } else {
        window.location.assign("/home");
      }
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
      <div className="register-box">
        <div className="left-container">
          <img
            src={RegisterImage}
            alt="Register Image"
            className="register-image"
          />
        </div>
        <div className="right-container">
          <div className="login-form-container">
            <h1 className="app-logo">
              {isRegistering ? "Sign Up!" : "Sign In!"}
            </h1>
            {error && <p className="error-message">{error}</p>}
            {isRegistering && (
              <input
                type="text"
                placeholder="Full Name"
                onChange={(e) => setFname(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            )}
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
            <button
              className="google-sign-in-button"
              onClick={signInWithGoogle}
            >
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
    </div>
  );
};

export default RegisterPage;
