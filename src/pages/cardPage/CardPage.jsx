import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../config/firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Navbar from "../../components/navbar/Navbar";
import { TbCardsFilled } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import "./cardPage.css";

const CardPage = () => {
  const { id } = useParams(); // Flashcard set ID from URL
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [comments, setComments] = useState([]); // Comments state
  const [newComment, setNewComment] = useState("");
  const [quizResults, setQuizResults] = useState([]); // Quiz results state
  const [userRole, setUserRole] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [timerMinutes, setTimerMinutes] = useState(0); // State to hold minutes
  const [timerSeconds, setTimerSeconds] = useState(0); // State to hold seconds

  // Fetch flashcard set data from Firestore
  useEffect(() => {
    const fetchFlashcardSet = async () => {
      const docRef = doc(db, "flashcards", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setFlashcardSet({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log("No such document!");
      }
    };

    fetchFlashcardSet();
  }, [id]);

  // Fetch comments and quiz results in real-time from Firestore
  useEffect(() => {
    const fetchCommentsAndResults = async () => {
      // Real-time comments
      const commentsRef = collection(db, "comments");
      const q = query(commentsRef, where("flashcardSetId", "==", id)); // Filter by flashcard set ID
      const unsubscribeComments = onSnapshot(q, (snapshot) => {
        const loadedComments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComments(loadedComments);
      });

      // Real-time quiz results
      const resultsRef = collection(db, "results"); // Directly accessing the "results" collection
      const resultsQuery = query(resultsRef, where("flashcardSetId", "==", id)); // Filter by flashcardSetId
      const unsubscribeResults = onSnapshot(resultsQuery, (snapshot) => {
        const loadedResults = snapshot.docs
          .map((doc) => {
            const resultData = doc.data();
            return {
              id: doc.id,
              ...resultData,
              timestamp: resultData.timestamp?.toDate(), // Ensure timestamp is converted to a JavaScript Date object
            };
          })
          .sort((a, b) => b.timestamp - a.timestamp); // Sort results by timestamp (newest first)

        // Show only the latest 3 results
        setQuizResults(loadedResults.slice(0, 3)); // Show only the latest 3 results
      });

      return () => {
        unsubscribeComments();
        unsubscribeResults();
      };
    };

    fetchCommentsAndResults();
  }, [id]);

  // Fetch the user's role from Firestore
  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const userRef = doc(db, "Users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserRole(userSnap.data().role);
          } else {
            console.log("User document not found!");
          }
        } catch (error) {
          console.error("Error fetching user role: ", error);
        }
      }
    };

    fetchUserRole();
  }, [user]);

  // Handle new comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    try {
      const commentsRef = collection(db, "comments"); // Save in the separate "comments" collection
      await addDoc(commentsRef, {
        flashcardSetId: id, // Link the comment to the flashcard set
        text: newComment,
        author: user.displayName || "Anonymous",
        uid: user.uid, // Save the user ID of the person commenting
        timestamp: new Date(),
      });

      setNewComment(""); // Clear the comment input
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };

  const handleTimedPractice = () => {
    setIsModalOpen(true); // Open the modal for timer input
  };

  const handleStartTimedQuiz = () => {
    const totalTimeInSeconds = Number(timerMinutes) * 60 + Number(timerSeconds); // Convert to total seconds
    setIsModalOpen(false); // Close the modal
    navigate(`/quiz/${flashcardSet.id}`, {
      state: { timer: totalTimeInSeconds }, // Pass total time to QuizPage
    });
  };

  if (!flashcardSet) return <div>Loading...</div>;

  return (
    <div className="card-page">
      <Navbar />
      <div className="flashcard-container">
        <p className="flashcard-title">{flashcardSet.title}</p>
        <p className="flashcard-creator">
          Created by: {flashcardSet.creator} ({flashcardSet.completedUsers}{" "}
          plays)
        </p>
        <div className="flashcard-header">
          <div className="flashcard-description-box">
            <p>{flashcardSet.description}</p>
            <p className="flashcard-category">
              {flashcardSet.category} Category
            </p>
          </div>
          <div className="flashcard-buttons-container">
            <div className="flashcard-buttons">
              {/* Conditionally render buttons based on user role */}
              {userRole === "user" && (
                <>
                  <button
                    onClick={() => navigate(`/quiz/${flashcardSet.id}`)}
                    className="quiz-button"
                  >
                    Practice
                  </button>
                  <button
                    onClick={handleTimedPractice}
                    className="timed-quiz-button"
                  >
                    Timed Practice
                  </button>
                </>
              )}
            </div>
            <p className="flashcard-count">
              {flashcardSet.cards.length} cards <TbCardsFilled />
            </p>
          </div>
        </div>

        {/* Custom Modal */}
        {isModalOpen && (
          <div className="custom-modal">
            <div className="modal-content">
              <h2>Set Timer</h2>
              <p>Enter the number of minutes and seconds</p>
              <input
                type="number"
                value={timerMinutes}
                onChange={(e) => setTimerMinutes(e.target.value)}
                placeholder="Minutes"
                min="0"
                className="timer-input"
              />
              <input
                type="number"
                value={timerSeconds}
                onChange={(e) => setTimerSeconds(e.target.value)}
                placeholder="Seconds"
                min="0"
                max="59"
                className="timer-input"
              />
              <div className="modal-buttons">
                <button
                  onClick={handleStartTimedQuiz}
                  className="start-quiz-button"
                >
                  Start Quiz
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="comments-section">
          <h3>Comments</h3>
          {user ? (
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="comment-input"
              ></textarea>
              <div className="comment-buttons">
                <button type="submit" className="comment-submit-button">
                  Submit
                </button>
                <button type="button" className="comment-cancel-button">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p>You must be logged in to leave a comment.</p>
          )}

          <div className="comments-list">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="comment">
                  <div className="comment-header">
                    <strong>{comment.author}</strong>
                    <p className="comment-timestamp">
                      {new Date(comment.timestamp.toDate()).toLocaleString()}
                    </p>
                  </div>
                  <p>{comment.text}</p>
                </div>
              ))
            ) : (
              <p>No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>

        {/* Quiz Results Section */}
        <div className="quiz-results-section">
          <h3>Recent Quiz Attempts</h3>
          {quizResults.length > 0 ? (
            <ul>
              {quizResults.map((result) => (
                <li key={result.id}>
                  <strong>{result.userName}</strong>: {result.score}/
                  {flashcardSet.cards.length}
                  <p className="result-timestamp">
                    {new Date(result.timestamp).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No quiz attempts yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardPage;
