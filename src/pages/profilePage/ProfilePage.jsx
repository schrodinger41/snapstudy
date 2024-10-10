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
import FlashcardSet from "../../components/flashcardSet/FlashcardSet"; // Import the FlashcardSet component
import "./profilePage.css";

const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [userResults, setUserResults] = useState([]); // State to hold user results
  const [userComments, setUserComments] = useState([]); // State to hold user comments
  const [userFlashcards, setUserFlashcards] = useState([]); // State to hold flashcard sets created by the user
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

        const resultsData = await Promise.all(
          querySnapshot.docs.map(async (resultDoc) => {
            const resultData = resultDoc.data();

            // Fetch the corresponding flashcard set
            const flashcardRef = doc(
              db,
              "flashcards",
              resultData.flashcardSetId
            );
            const flashcardDoc = await getDoc(flashcardRef);
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

        setUserResults(resultsData); // Update state with fetched user results
      }
    };

    const fetchUserComments = async () => {
      if (userUID) {
        const commentsRef = collection(db, "comments");
        const commentsQuery = query(commentsRef, where("uid", "==", userUID));
        const commentsSnapshot = await getDocs(commentsQuery);

        const commentsData = await Promise.all(
          commentsSnapshot.docs.map(async (commentDoc) => {
            const commentData = commentDoc.data();

            // Fetch the corresponding flashcard set
            const flashcardRef = doc(
              db,
              "flashcards",
              commentData.flashcardSetId
            );
            const flashcardDoc = await getDoc(flashcardRef);
            const flashcardData = flashcardDoc.exists()
              ? flashcardDoc.data()
              : null;

            return {
              text: commentData.text,
              flashcardSetId: commentData.flashcardSetId,
              flashcardSetTitle: flashcardData ? flashcardData.title : "N/A",
              timestamp: commentData.timestamp,
            };
          })
        );

        setUserComments(commentsData); // Update state with fetched comments
      }
    };

    const fetchUserFlashcards = async () => {
      if (userUID) {
        const flashcardsRef = collection(db, "flashcards");
        const flashcardsQuery = query(
          flashcardsRef,
          where("uid", "==", userUID)
        );
        const flashcardsSnapshot = await getDocs(flashcardsQuery);

        const flashcardsData = flashcardsSnapshot.docs.map((flashcardDoc) => {
          const flashcardData = flashcardDoc.data();
          return {
            id: flashcardDoc.id,
            ...flashcardData, // Include all flashcard data (title, cardCount, etc.)
          };
        });

        // Sort by createdAt and slice to get the two most recent flashcards
        const sortedFlashcards = flashcardsData
          .sort((a, b) => b.createdAt - a.createdAt) // Sort in descending order
          .slice(0, 2); // Get the two most recent flashcard sets

        setUserFlashcards(sortedFlashcards); // Update state with fetched flashcard sets
      }
    };

    fetchUserInfo();
    fetchUserResults();
    fetchUserComments();
    fetchUserFlashcards(); // Fetch flashcards created by the user
  }, [userUID]);

  if (!userInfo) {
    return <div>Loading user info...</div>; // Display a loading message
  }

  return (
    <div className="profile-page">
      <Navbar />
      <h1>{userInfo.fullName}'s Profile</h1>

      {/* Results Table */}
      <h2>Your Recent Results</h2>
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

      {/* Comments Table */}
      <h2>Your Comments</h2>
      <table className="comments-table">
        <thead>
          <tr>
            <th>Flashcard Set Title</th>
            <th>Comment</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {userComments.length > 0 ? (
            userComments.map((comment, index) => (
              <tr key={index}>
                <td>{comment.flashcardSetTitle}</td>
                <td>{comment.text}</td>
                <td>
                  {new Date(comment.timestamp.seconds * 1000).toLocaleString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No comments found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Flashcard Sets Created by User */}
      <h2>Your Flashcard Sets</h2>
      <div className="flashcard-sets-container">
        {userFlashcards.length > 0 ? (
          userFlashcards.map((flashcardSet) => (
            <FlashcardSet
              key={flashcardSet.id}
              id={flashcardSet.id}
              title={flashcardSet.title}
              cardCount={flashcardSet.cardCount}
              creator={userInfo.fullName} // Assuming the creator is the current user
              completedUsers={flashcardSet.completedUsers || 0} // Default to 0 if not available
            />
          ))
        ) : (
          <p>No flashcard sets created.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
