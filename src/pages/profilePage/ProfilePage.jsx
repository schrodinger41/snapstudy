import React, { useState, useEffect } from "react";
import { db } from "../../config/firebase"; // Ensure you have this import
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
} from "firebase/firestore";
import Navbar from "../../components/navbar/Navbar";
import { FaEdit  } from "react-icons/fa";
import FlashcardSet from "../../components/flashcardSet/FlashcardSet"; // Import the FlashcardSet component
import "./profilePage.css";

const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState({
    fullName: "",
    bio: "", // Add bio to the state
  });
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false); // State for editing name
  const [originalBio, setOriginalBio] = useState("");
  const [originalName, setOriginalName] = useState(""); // State for original name
  const [userResults, setUserResults] = useState([]); // State to hold user results
  const [userComments, setUserComments] = useState([]); // State to hold user comments
  const [userFlashcards, setUserFlashcards] = useState([]); // State to hold flashcard sets created by the user
  const userUID = localStorage.getItem("userUID"); // Retrieve UID from local storage
  const [flashcardCount, setFlashcardCount] = useState(0); // State to hold the count of flashcard sets
  const [totalCompletedFlashcards, setTotalCompletedFlashcards] = useState(0); // New state for total completed flashcards count

  console.log("Current user UID from local storage:", userUID);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (userUID) {
        const userRef = doc(db, "Users", userUID);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserInfo({
            fullName: data.fullName,
            bio: data.bio || "", // Fetch bio
          });
          setOriginalBio(data.bio || "");
          setOriginalName(data.fullName); // Store original name
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

            // Count the number of cards in the cards array
            const cardCount =
              flashcardData && flashcardData.cards
                ? flashcardData.cards.length
                : 0;

            return {
              score: resultData.score,
              flashcardSetId: resultData.flashcardSetId,
              flashcardSetTitle: flashcardData ? flashcardData.title : "N/A",
              cardCount: cardCount, // Use the counted cards
              timestamp: resultData.timestamp,
            };
          })
        );

        // Sort results by timestamp and slice to get the five most recent results
        const sortedResults = resultsData.sort(
          (a, b) => b.timestamp.seconds - a.timestamp.seconds
        );

        const recentResults = sortedResults.slice(0, 5);
        setUserResults(recentResults); // Update state with the most recent results
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
            ...flashcardData,
            cardCount: flashcardData.cards ? flashcardData.cards.length : 0,
          };
        });

        // Set the flashcard count
        setFlashcardCount(flashcardsData.length); // Update count here

        const sortedFlashcards = flashcardsData
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 2);

        setUserFlashcards(sortedFlashcards);
      }
    };

    // Call functions to fetch data
    fetchUserInfo();
    fetchUserResults();
    fetchUserComments();
    fetchUserFlashcards(); // Fetch flashcards created by the user
    fetchCompletedFlashcardsCount();
  }, [userUID]);

  const fetchCompletedFlashcardsCount = async () => {
    const resultsRef = collection(db, "results");
    const querySnapshot = await getDocs(resultsRef);
    setTotalCompletedFlashcards(querySnapshot.docs.length); // Set the total number of completed flashcards
  };

  const saveBio = async () => {
    const userRef = doc(db, "Users", userUID);
    await setDoc(userRef, { bio: userInfo.bio }, { merge: true });
    setOriginalBio(userInfo.bio);
    setIsEditingBio(false);
  };

  const saveName = async () => {
    const userRef = doc(db, "Users", userUID);
    await setDoc(userRef, { fullName: userInfo.fullName }, { merge: true });

    // Update any other necessary collections if required (e.g., comments, results)
    const resultsRef = collection(db, "results");
    const resultsQuery = query(resultsRef, where("userId", "==", userUID));
    const resultsSnapshot = await getDocs(resultsQuery);
    resultsSnapshot.forEach(async (resultDoc) => {
      const resultRef = doc(resultsRef, resultDoc.id);
      await setDoc(resultRef, { userName: userInfo.fullName }, { merge: true });
    });

    const commentsRef = collection(db, "comments");
    const commentsQuery = query(commentsRef, where("uid", "==", userUID));
    const commentsSnapshot = await getDocs(commentsQuery);
    commentsSnapshot.forEach(async (commentDoc) => {
      const commentRef = doc(commentsRef, commentDoc.id);
      await setDoc(
        commentRef,
        { userName: userInfo.fullName },
        { merge: true }
      );
    });

    setOriginalName(userInfo.fullName); // Update original name
    setIsEditingName(false);
  };

  const cancelEditBio = () => {
    setUserInfo((prevUserInfo) => ({
      ...prevUserInfo,
      bio: originalBio, // Restore original bio
    }));
    setIsEditingBio(false);
  };

  const cancelEditName = () => {
    setUserInfo((prevUserInfo) => ({
      ...prevUserInfo,
      fullName: originalName, // Restore original name
    }));
    setIsEditingName(false);
  };

  if (!userInfo) {
    return <div>Loading user info...</div>; // Display a loading message
  }

  return (
    <div className="profile-page">
      <Navbar />
      <div className="profile-first-section">
      <div className="profile-info">
        <h1>
          {isEditingName ? (
            <div className="edit-name-section">
              <input
                className="edit-name-input"
                type="text"
                value={userInfo.fullName}
                onChange={(e) =>
                  setUserInfo({ ...userInfo, fullName: e.target.value })
                }
              />
              <button onClick={saveName} className="save-edit-button">Save</button>
              <button onClick={cancelEditName} className="cancel-edit-button">Cancel</button>
            </div>
          ) : (
            <div className="name-container">
              <p>{userInfo.fullName}'s Profile</p>
              <FaEdit onClick={() => setIsEditingName(true)} className="edit-name-icon" />
            </div>
          )}
        </h1>
        
        <div className="set-details">
          <p>
            Sets Created: {flashcardCount}
            {flashcardCount !== 1 ? "s" : ""}
          </p>
          <p>
            Sets Completed: {totalCompletedFlashcards}
          </p>
        </div>

        {/* Bio Section */}
        <div className="bio-box">
          <h2>
            Bio
            <FaEdit onClick={() => setIsEditingBio(true)} className="edit-bio-icon" />
          </h2>
          {isEditingBio ? (
            <textarea
              className="edit-bio-input"
              value={userInfo.bio}
              onChange={(e) => setUserInfo({ ...userInfo, bio: e.target.value })}
            />
          ) : (
            <p>{userInfo.bio || "No bio available."}</p>
          )}
          {userUID && (
            <div>
              {isEditingBio ? (
                <div>
                  <button onClick={saveBio} className="save-edit-button">Save</button>
                  <button onClick={cancelEditBio} className="cancel-edit-button">Cancel</button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

        <div className="my-flashcards">
          <h2>Your Flashcard Sets</h2>
          <div className="flashcard-sets-container">
            {userFlashcards.length > 0 ? (
              userFlashcards.map((flashcardSet) => (
                <FlashcardSet
                  key={flashcardSet.id}
                  id={flashcardSet.id}
                  title={flashcardSet.title}
                  cardCount={flashcardSet.cardCount} // Pass card count here
                  creator={userInfo.fullName} // Assuming the creator is the current user
                  completedUsers={flashcardSet.completedUsers || 0} // Default to 0 if not available
                />
              ))
            ) : (
              <p>No flashcard sets created.</p>
            )}
          </div>
        </div>  
      </div>

      {/* Results Table */}
      <div className="my-recent-results">
      <h2>Your Recent Results</h2>
      <table className="results-table">
        <thead>
          <tr>
            <th>Flashcard Set Title</th>
            <th>Number of Cards</th> {/* Column for card count */}
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {userResults.length > 0 ? (
            userResults.map((result, index) => (
              <tr key={index}>
                <td>{result.flashcardSetTitle}</td>
                <td>{result.cardCount}</td> {/* Display card count */}
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
      {/* Comments Table */}
      <div className="my-comments">
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
      </div>
    </div>
  );
};

export default ProfilePage;
