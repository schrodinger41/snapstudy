import React, { useState, useEffect } from "react";
import { db } from "../../config/firebase"; // Ensure you have this import
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Navbar from "../../components/navbar/Navbar";
import "./profilePage.css";

const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [userResults, setUserResults] = useState([]); // State to hold user results
  const userUID = localStorage.getItem("userUID"); // Retrieve UID from local storage
  console.log("Current user UID from local storage:", userUID);

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

    const fetchUserResults = async () => {
      if (userUID) {
        const resultsRef = collection(db, "results");
        const resultsQuery = query(resultsRef, where("userId", "==", userUID));
        const querySnapshot = await getDocs(resultsQuery);
        console.log("Number of results found:", querySnapshot.size);

        if (querySnapshot.empty) {
          console.log("No results found for user ID:", userUID);
        } else {
          console.log("Results found for user ID:", userUID);
        }

        const resultsData = await Promise.all(
          querySnapshot.docs.map(async (resultDoc) => {
            const resultData = resultDoc.data();
            console.log("Result data:", resultData); // Log result data

            // Fetch the corresponding flashcard set
            const flashcardRef = doc(
              db,
              "flashcards",
              resultData.flashcardSetId
            );
            const flashcardDoc = await getDoc(flashcardRef);

            if (!flashcardDoc.exists()) {
              console.log(
                "Flashcard not found for ID:",
                resultData.flashcardSetId
              );
            }

            const flashcardData = flashcardDoc.exists()
              ? flashcardDoc.data()
              : null;

            return {
              score: resultData.score,
              flashcardSetId: resultData.flashcardSetId,
              flashcardSetTitle: flashcardData ? flashcardData.title : "N/A",
              timestamp: resultData.timestamp,
            };
          })
        );

        console.log("Fetched results data:", resultsData); // Log all results data
        setUserResults(resultsData); // Update state with fetched user results
      }
    };

    fetchUserInfo();
    fetchUserResults();
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

      <h2>Your Results</h2>
      <table className="results-table">
        <thead>
          <tr>
            <th>Flashcard Set Title</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {userResults.length > 0 ? (
            userResults.map((result, index) => (
              <tr key={index}>
                <td>{result.flashcardSetTitle}</td>
                <td>{result.score}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No results found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProfilePage;
