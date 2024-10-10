import React, { useState, useEffect } from "react";
import { db } from "../../config/firebase"; // Ensure you have this import
import { doc, getDoc } from "firebase/firestore";
import Navbar from "../../components/navbar/Navbar";
import "./profilePage.css";

const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const userUID = localStorage.getItem("userUID"); // Retrieve UID from local storage

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (userUID) {
        const userRef = doc(db, "Users", userUID);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          setUserInfo(userDoc.data());
        }
      }
    };

    fetchUserInfo();
  }, [userUID]);

  if (!userInfo) {
    return <div>Loading user info...</div>; // Display a loading message
  }

  return (
    <div className="profile-page">
      <Navbar />
      <h1>{userInfo.fullName}'s Profile</h1>
      <p>Email: {userInfo.email}</p>
      <p>Role: {userInfo.role}</p>
      {/* Add more user info as needed */}
    </div>
  );
};

export default ProfilePage;
