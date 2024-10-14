import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../config/firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
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
  const [editCommentText, setEditCommentText] = useState(""); // Separate state for editing comment
  const [quizResults, setQuizResults] = useState([]); // Quiz results state
  const [userRole, setUserRole] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [timerMinutes, setTimerMinutes] = useState(0); // State to hold minutes
  const [timerSeconds, setTimerSeconds] = useState(0); // State to hold seconds
  const [editingCommentId, setEditingCommentId] = useState(null); // Track the comment being edited
  const [dropdownVisible, setDropdownVisible] = useState(null); // Track dropdown visibility for each comment

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
        userName: user.displayName || "Anonymous",
        uid: user.uid, // Save the user ID of the person commenting
        timestamp: new Date(),
      });

      setNewComment(""); // Clear the comment input
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };

  // Edit comment
  const handleEditComment = async (commentId) => {
    try {
      const commentRef = doc(db, "comments", commentId);
      await updateDoc(commentRef, {
        text: editCommentText,
        edited: true, // Add an "edited" flag to the comment
        timestamp: new Date(), // Update timestamp to reflect the change
      });
      setEditingCommentId(null); // Exit edit mode after successful update
      setEditCommentText(""); // Clear the edit input after saving
    } catch (error) {
      console.error("Error editing comment: ", error);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      const commentRef = doc(db, "comments", commentId);
      await deleteDoc(commentRef);
      console.log("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment: ", error);
    }
  };

  // Report comment (placeholder functionality)
  const handleReportComment = (commentId) => {
    console.log("Reported comment ID: ", commentId);
    // Add logic to handle reporting the comment
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

      <div className="content-sections">
        <div className="comments-section">
          <h2>Comments</h2>
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="comment-input"
              placeholder="Leave a comment..."
            />
            <button type="submit" className="comment-submit-button">
              Submit
            </button>
          </form>

        {/* Display comments */}
        <div className="comments-list">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <div className="comment-author">
                  <strong>{comment.userName}</strong>
                  {comment.edited && (
                      <span className="edited-text"> (edited)</span>
                    )}
                  </div>                 
                  <p className="comment-timestamp">
                    {new Date(comment.timestamp.toDate()).toLocaleString()}
                  </p>

                    {/* Three-dotted menu button */}
                    <div className="comment-options">
                      <button
                        className="options-button"
                        onClick={() =>
                          setDropdownVisible(
                            dropdownVisible === comment.id ? null : comment.id
                          )
                        }
                      >
                        ⋮
                      </button>
                      {dropdownVisible === comment.id && (
                        <div className="options-menu">
                          {user.uid === comment.uid ? (
                            <>
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setEditCommentText(comment.text); // Set the existing comment text in the edit state
                                }}
                                className="edit-button"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="delete-button"
                              >
                                Delete
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleReportComment(comment.id)}
                              className="report-button"
                            >
                              Report
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {editingCommentId === comment.id ? (
                    <div className="edit-comment-form">
                      <textarea
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        className="comment-edit-input"
                      ></textarea>
                      <button
                        onClick={() => handleEditComment(comment.id, newComment)}
                        className="save-edit-button"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCommentId(null)}
                        className="cancel-edit-button"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p>{comment.text}</p>
                  )}
                </div>
              ))
            ) : (
              <p>No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
        
        <div className="quiz-results-container">
          {/* Display the latest 3 quiz results */}
          <div className="quiz-results-section">
            <h2>Recent Scores</h2>
            <ul>
              {quizResults.map((result) => (
                <li key={result.id}>
                  <strong>{result.userName}</strong>: {result.score} points (
                  {new Date(result.timestamp).toLocaleString()})
                </li>
              ))}
            </ul>
          </div>

          {/* Display the latest 3 timed quiz results */}
          <div className="timed-quiz-results-section">
            <h2>Recent Timed Scores</h2>
          </div>
        </div>  
      </div>
      </div>
    </div>
  );
};

export default CardPage;
