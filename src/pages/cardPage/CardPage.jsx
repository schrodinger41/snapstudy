import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../config/firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
} from "firebase/firestore"; // Add necessary Firestore methods
import { getAuth } from "firebase/auth"; // Import Firebase Auth to get the currently logged-in user
import Navbar from "../../components/navbar/Navbar";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import "./cardPage.css";

const CardPage = () => {
  const { id } = useParams(); // Get the flashcard set id from the URL
  const [flashcardSet, setFlashcardSet] = useState(null); // State to hold the flashcard set
  const [comments, setComments] = useState([]); // State to hold the comments
  const [newComment, setNewComment] = useState(""); // State to hold the new comment input
  const [quizResults, setQuizResults] = useState([]); // State to hold the quiz results
  const auth = getAuth(); // Get the currently logged-in user
  const user = auth.currentUser; // Current user info
  const navigate = useNavigate(); // Initialize navigate function

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

  useEffect(() => {
    // Listen for real-time updates to comments
    const commentsRef = collection(db, "flashcards", id, "comments");
    const unsubscribeComments = onSnapshot(commentsRef, (snapshot) => {
      const loadedComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(loadedComments);
    });

    // Listen for real-time updates to quiz results
    const resultsRef = collection(db, "flashcards", id, "results");
    const unsubscribeResults = onSnapshot(resultsRef, (snapshot) => {
      const loadedResults = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => b.timestamp - a.timestamp); // Sort results by timestamp descending
      setQuizResults(loadedResults.slice(0, 5)); // Take the latest 5 results
    });

    return () => {
      unsubscribeComments();
      unsubscribeResults();
    };
  }, [id]);

  // Handle new comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) return; // Prevent empty comment submission

    try {
      // Add the comment to Firestore under the specific flashcard set
      const commentsRef = collection(db, "flashcards", id, "comments");
      await addDoc(commentsRef, {
        text: newComment,
        author: user.displayName || "Anonymous",
        timestamp: new Date(),
      });

      setNewComment(""); // Clear the input field after submission
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };

  if (!flashcardSet) return <div>Loading...</div>; // Loading state

  return (
    <div className="card-page">
      <Navbar />
      <h2>{flashcardSet.title}</h2>
      <p>Created by: {flashcardSet.creator}</p>
      <p>{flashcardSet.cards.length} cards available</p>
      {/* Take Quiz Button */}
      <button
        onClick={() => navigate(`/quiz/${flashcardSet.id}`)}
        className="quiz-button"
      >
        Practice
      </button>
      <button>Timed Practice</button>
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
            <button type="submit" className="comment-submit-button">
              Submit
            </button>
          </form>
        ) : (
          <p>You must be logged in to leave a comment.</p>
        )}

        {/* Display Comments */}
        <div className="comments-list">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="comment">
                <p>
                  <strong>{comment.author}</strong>
                </p>
                <p>{comment.text}</p>
                <p className="comment-timestamp">
                  {new Date(comment.timestamp.toDate()).toLocaleString()}
                </p>
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
                  {new Date(result.timestamp.toDate()).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No quiz attempts yet.</p>
        )}
      </div>
    </div>
  );
};

export default CardPage;
