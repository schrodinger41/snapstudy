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
import { useNavigate } from "react-router-dom";
import "./cardPage.css";

const CardPage = () => {
  const { id } = useParams(); // Flashcard set ID from URL
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [comments, setComments] = useState([]); // Comments state
  const [newComment, setNewComment] = useState("");
  const [quizResults, setQuizResults] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

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

  // Fetch comments for the flashcard set in real-time from the "comments" collection
  useEffect(() => {
    const commentsRef = collection(db, "comments");
    const q = query(commentsRef, where("flashcardSetId", "==", id)); // Filter by flashcard set ID
    const unsubscribeComments = onSnapshot(q, (snapshot) => {
      const loadedComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(loadedComments);
    });

    const resultsRef = collection(db, "flashcards", id, "results");
    const unsubscribeResults = onSnapshot(resultsRef, (snapshot) => {
      const loadedResults = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => b.timestamp - a.timestamp);
      setQuizResults(loadedResults.slice(0, 5));
    });

    return () => {
      unsubscribeComments();
      unsubscribeResults();
    };
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

  if (!flashcardSet) return <div>Loading...</div>;

  return (
    <div className="card-page">
      <Navbar />
      <h2>{flashcardSet.title}</h2>
      <p>Created by: {flashcardSet.creator}</p>
      <p>{flashcardSet.cards.length} cards available</p>

      <p>
        <strong>Description:</strong> {flashcardSet.description}
      </p>
      <p>
        <strong>Category:</strong> {flashcardSet.category}
      </p>
      <p>
        {flashcardSet.completedUsers} <strong>plays</strong>
      </p>

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
            onClick={() => navigate(`/timed-quiz/${flashcardSet.id}`)}
            className="timed-quiz-button"
          >
            Timed Practice
          </button>
        </>
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
            <button type="submit" className="comment-submit-button">
              Submit
            </button>
          </form>
        ) : (
          <p>You must be logged in to leave a comment.</p>
        )}

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
