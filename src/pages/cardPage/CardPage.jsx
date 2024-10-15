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
import LoadingGif from "../../images/loading.gif"
import { TbCardsFilled } from "react-icons/tb";
import { FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./cardPage.css";

const CardPage = () => {
  const { id } = useParams(); // Flashcard set ID from URL
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editCommentText, setEditCommentText] = useState("");
  const [quizResults, setQuizResults] = useState([]);
  const [timedQuizResults, setTimedQuizResults] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false); // New report modal state
  const [isReportCommentModalOpen, setIsReportCommentModalOpen] =
    useState(false); // New report modal state
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(null);
  const [selectedReportReasons, setSelectedReportReasons] = useState([]); // State to hold selected report reasons
  const [reportCommentId, setReportCommentId] = useState(null); // State to hold the comment ID being reported

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

        // Filter and show the latest 3 timed quiz results with time taken > 0
        const filteredTimedResults = loadedResults
          .filter((result) => result.timeTaken > 0)
          .slice(0, 3);
        setTimedQuizResults(filteredTimedResults);
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

  // Handle report submission
  const handleReportSubmit = async () => {
    try {
      const reportsRef = collection(db, "reportSets"); // Create a "reports" collection in Firestore
      await addDoc(reportsRef, {
        flashcardSetId: id,
        userName: user.displayName || "Anonymous",
        uid: user.uid,
        reasons: selectedReportReasons,
        timestamp: new Date(),
      });
      setIsReportModalOpen(false); // Close the report modal
      setSelectedReportReasons([]); // Reset selected reasons
    } catch (error) {
      console.error("Error reporting flashcard: ", error);
    }
  };

  // Handle report submission for comments
  const handleCommentReportSubmit = async () => {
    try {
      const reportsRef = collection(db, "reportComments"); // Create a "reportComments" collection in Firestore
      await addDoc(reportsRef, {
        commentId: reportCommentId, // ID of the reported comment
        userName: user.displayName || "Anonymous",
        uid: user.uid,
        reasons: selectedReportReasons,
        timestamp: new Date(),
      });
      setIsReportCommentModalOpen(false); // Close the report modal
      setReportCommentId(null); // Reset report comment ID
      setSelectedReportReasons([]); // Reset selected reasons
    } catch (error) {
      console.error("Error reporting comment: ", error);
    }
  };

  // Handle toggling of report reasons
  const toggleReportReason = (reason) => {
    setSelectedReportReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
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

  // Report comment
  const handleReportComment = (commentId) => {
    setReportCommentId(commentId); // Set the comment ID to report
    setIsReportCommentModalOpen(true); // Open report modal
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

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  if (!flashcardSet) return <div class="loading-screen">
  <img src={LoadingGif} alt="Loading..." className="loading-gif" />
  </div>;

  return (
    <div className="card-page">
      <Navbar />
      <div className="flashcard-container">
        <div className="flashcard-title-line">
          <p className="flashcard-title">{flashcardSet.title}</p>
          <FaExclamationTriangle
            className="report-icon"
            onClick={() => setIsReportModalOpen(true)} // Open report modal on click
          />
        </div>
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

        {/* Report Modal */}
        {isReportModalOpen && (
          <div className="report-modal">
            <div className="report-modal-content">
              <h2>Report This Flashcard</h2>
              <p>Please select the reason(s) for reporting:</p>
              <div className="report-reasons">
                {[
                  "Sexual Content",
                  "Inappropriate",
                  "Hateful or Abusive Content",
                  "Misinformation",
                  "Harmful",
                  "Spam",
                  "Misleading",
                ].map((reason) => (
                  <label key={reason} className="report-reason-label">
                    <input
                      type="checkbox"
                      checked={selectedReportReasons.includes(reason)}
                      onChange={() => toggleReportReason(reason)}
                    />
                    {reason}
                  </label>
                ))}
              </div>
              <div className="report-modal-buttons">
                <button
                  onClick={handleReportSubmit}
                  className="submit-report-button"
                >
                  Submit Report
                </button>
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="cancel-report-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {isReportCommentModalOpen && (
          <div className="custom-modal">
            <div className="modal reportcommentmodal">
              <h2 className="reportcommentmodal-title">Report Comment</h2>
              <p>Please select reasons for reporting:</p>
              <div className="reportcommentmodal-reasons">
                {["Spam", "Inappropriate Content", "Harassment", "Other"].map(
                  (reason) => (
                    <div key={reason}>
                      <input
                        type="checkbox"
                        checked={selectedReportReasons.includes(reason)}
                        onChange={() => toggleReportReason(reason)}
                        className="reportcommentmodal-checkbox"
                      />
                      <label className="reportcommentmodal-label">{reason}</label>
                    </div>
                  )
                )}
              </div>
              <div className="reportcommentmodal-buttons">
                <button
                  className="reportcommentmodal-submit"
                  onClick={handleCommentReportSubmit}
                >
                  Submit Report
                </button>
                <button
                  className="reportcommentmodal-close"
                  onClick={() => setIsReportCommentModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Modal */}
        {isModalOpen && (
          <div className="custom-modal">
            <div className="modal-content">
              <h2>Set Timer</h2>
              <div className="time-input-wrapper">
                <input
                  type="number"
                  value={timerMinutes}
                  onChange={(e) => setTimerMinutes(e.target.value)}
                  min="0"
                  className="timer-input"
                />
                <span className="colon">:</span> {/* Separator */}
                <input
                  type="number"
                  value={timerSeconds}
                  onChange={(e) => setTimerSeconds(e.target.value)}
                  min="0"
                  max="59"
                  className="timer-input"
                />
              </div>
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
                        {new Date(comment.timestamp.toDate()).toLocaleString(
                          undefined,
                          {
                            year: "numeric",
                            month: "numeric",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true, // Use false for 24-hour format
                          }
                        )}
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
                                  onClick={() =>
                                    handleDeleteComment(comment.id)
                                  }
                                  className="delete-button"
                                >
                                  Delete
                                </button>
                              </>
                            ) : (
                              <button
                                className="report-comment"
                                onClick={() => handleReportComment(comment.id)}
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
                          onClick={() =>
                            handleEditComment(comment.id, newComment)
                          }
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
                    <strong>{result.userName}</strong> {result.score}/
                    {flashcardSet.cards.length}
                  </li>
                ))}
              </ul>
            </div>

            {/* Display the latest 3 timed quiz results */}
          <div className="timed-quiz-results-section">
            <h2>Recent Timed Scores</h2>
            {timedQuizResults.length > 0 ? (
              <ul>
                {timedQuizResults.map((result) => (
                  <li key={result.id} className="timed-quiz-result">
                    <strong>{result.userName}</strong>
                    <div className="timed-quiz-result-info">
                      <span className="timed-quiz-score">{result.score}/
                      {flashcardSet.cards.length}</span>
                      <span className="timed-quiz-time">{formatTime(result.timeTaken)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No timed quiz results available.</p>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardPage;
