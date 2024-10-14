import React, { useEffect, useState } from "react";
import { db } from "../../config/firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  deleteDoc,
  doc,
  getDoc, // Import getDoc to retrieve specific documents
} from "firebase/firestore";
import Navbar from "../../components/navbar/Navbar";
import { useNavigate } from "react-router-dom"; // Import the hook
import "./adminPage.css";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [flashcardCounts, setFlashcardCounts] = useState({});
  const [commentsCount, setCommentsCount] = useState({});
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [reportedCards, setReportedCards] = useState([]);
  const [flashcardCreators, setFlashcardCreators] = useState({});
  const [reportedComments, setReportedComments] = useState([]);
  const [commentUsers, setCommentUsers] = useState({});
  const [flashcardTitles, setFlashcardTitles] = useState({}); // State for flashcard titles
  const navigate = useNavigate();

  // Fetch Users
  useEffect(() => {
    const fetchUsers = () => {
      const usersRef = collection(db, "Users");
      const unsubscribe = onSnapshot(usersRef, (snapshot) => {
        const userData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userData);
      });

      return () => unsubscribe();
    };

    fetchUsers();
  }, []);

  // Fetch Flashcard Counts
  useEffect(() => {
    const fetchFlashcardCounts = () => {
      const flashcardsRef = collection(db, "flashcards");
      const counts = {};

      users.forEach((user) => {
        const q = query(flashcardsRef, where("uid", "==", user.id));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          counts[user.id] = snapshot.docs.length;
          setFlashcardCounts({ ...counts });
        });

        return () => unsubscribe();
      });
    };

    if (users.length > 0) {
      fetchFlashcardCounts();
    }
  }, [users]);

  // Fetch Comment Counts
  useEffect(() => {
    const fetchCommentCounts = () => {
      const commentsRef = collection(db, "comments");
      const counts = {};

      users.forEach((user) => {
        const q = query(commentsRef, where("uid", "==", user.id));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          counts[user.id] = snapshot.docs.length; // Count comments for each user
          setCommentsCount({ ...counts });
        });

        return () => unsubscribe();
      });
    };

    if (users.length > 0) {
      fetchCommentCounts();
    }
  }, [users]);

  // Fetch Flashcard Sets
  useEffect(() => {
    const fetchFlashcardSets = () => {
      const flashcardsRef = collection(db, "flashcards");
      const unsubscribe = onSnapshot(flashcardsRef, (snapshot) => {
        const flashcardData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFlashcardSets(flashcardData);
      });

      return () => unsubscribe();
    };

    fetchFlashcardSets();
  }, []);

  // Fetch Reported Cards
  useEffect(() => {
    const fetchReportedCards = async () => {
      const reportSetsRef = collection(db, "reportSets");
      const unsubscribe = onSnapshot(reportSetsRef, async (snapshot) => {
        const reportedData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReportedCards(reportedData);

        // Fetch flashcard titles based on flashcardSetId
        const titlesMap = {};
        await Promise.all(
          reportedData.map(async (report) => {
            const flashcardRef = doc(db, "flashcards", report.flashcardSetId);
            const flashcardSnap = await getDoc(flashcardRef);
            if (flashcardSnap.exists()) {
              titlesMap[report.flashcardSetId] =
                flashcardSnap.data().title || "N/A";
            } else {
              titlesMap[report.flashcardSetId] = "N/A"; // Handle case where flashcard does not exist
            }
          })
        );
        setFlashcardTitles(titlesMap); // Store the titles in state
      });

      return () => unsubscribe();
    };

    fetchReportedCards();
  }, []);

  // Fetch Reported Comments
  useEffect(() => {
    const fetchReportedComments = () => {
      const reportCommentsRef = collection(db, "reportComments");
      const unsubscribe = onSnapshot(reportCommentsRef, async (snapshot) => {
        const reportedCommentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReportedComments(reportedCommentsData);

        // Fetch usernames for each reported comment
        const usersMap = {};
        await Promise.all(
          reportedCommentsData.map(async (report) => {
            const commentRef = doc(db, "comments", report.commentId);
            const commentSnap = await getDoc(commentRef);
            if (commentSnap.exists()) {
              usersMap[report.commentId] = commentSnap.data().userName || "N/A";
            }
          })
        );
        setCommentUsers(usersMap);
      });

      return () => unsubscribe();
    };

    fetchReportedComments();
  }, []);

  // Fetch Flashcard Creators
  useEffect(() => {
    const fetchFlashcardCreators = async () => {
      const creators = {};

      for (const report of reportedCards) {
        const flashcardRef = doc(db, "flashcards", report.flashcardSetId);
        const flashcardSnap = await getDoc(flashcardRef);

        if (flashcardSnap.exists()) {
          creators[report.flashcardSetId] =
            flashcardSnap.data().creator || "N/A"; // Store the creator or set to "N/A"
        }
      }

      setFlashcardCreators(creators);
    };

    if (reportedCards.length > 0) {
      fetchFlashcardCreators();
    }
  }, [reportedCards]);

  // Delete Flashcard Set
  const handleDeleteFlashcardSet = async (id) => {
    try {
      // Delete the flashcard set
      const flashcardDoc = doc(db, "flashcards", id);
      await deleteDoc(flashcardDoc);
      console.log("Flashcard set deleted successfully.");
    } catch (error) {
      console.error("Error deleting flashcard set: ", error);
    }
  };

  // Delete User
  const handleDeleteUser = async (id) => {
    try {
      const userDoc = doc(db, "Users", id);
      await deleteDoc(userDoc);
      console.log("User deleted successfully.");
    } catch (error) {
      console.error("Error deleting user: ", error);
    }
  };

  // Delete Flashcard Set and Report
  const handleDeleteFlashcardSetAndReport = async (
    flashcardSetId,
    reportId
  ) => {
    try {
      // Delete the flashcard set
      const flashcardDoc = doc(db, "flashcards", flashcardSetId);
      await deleteDoc(flashcardDoc);
      console.log("Flashcard set deleted successfully.");

      // Delete the report from reportSets
      const reportDoc = doc(db, "reportSets", reportId);
      await deleteDoc(reportDoc);
      console.log("Report deleted successfully.");
    } catch (error) {
      console.error("Error deleting flashcard set and report: ", error);
    }
  };

  // Delete Comment and Report
  const handleDeleteCommentAndReport = async (commentId, reportId) => {
    try {
      // Delete the comment
      const commentDoc = doc(db, "comments", commentId);
      await deleteDoc(commentDoc);
      console.log("Comment deleted successfully.");

      // Delete the report from reportComments
      const reportDoc = doc(db, "reportComments", reportId);
      await deleteDoc(reportDoc);
      console.log("Report deleted successfully.");
    } catch (error) {
      console.error("Error deleting comment and report: ", error);
    }
  };

  return (
    <div className="admin-page">
      <Navbar />
      <h1>Admin Dashboard</h1>

      {/* Accounts Table */}
      <h2>Accounts</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Card Sets Created</th>
            <th>Number of Comments</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.fullName || "N/A"}</td>
                <td>{user.email || "N/A"}</td>
                <td>{flashcardCounts[user.id] || 0}</td>
                <td>{commentsCount[user.id] || 0}</td>
                <td>
                  <button className="action-btn">Edit</button>
                  <button
                    className="action-btn"
                    onClick={() => handleDeleteUser(user.id)} // Call delete function
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No users found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Flashcard Sets Table */}
      <h2>Flashcard Sets</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Creator</th>
            <th>Play Count</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {flashcardSets.length > 0 ? (
            flashcardSets.map((set) => (
              <tr key={set.id}>
                <td>{set.id}</td>
                <td>{set.title || "N/A"}</td>
                <td>{set.description || "N/A"}</td>
                <td>{set.creator || "N/A"}</td>
                <td>{set.completedUsers || 0}</td>
                <td>
                  <button
                    className="action-btn"
                    onClick={() => navigate(`/card/${set.id}`)} // Navigate to the CardPage with the flashcard set ID
                  >
                    View
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => handleDeleteFlashcardSet(set.id)} // Call delete function
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No flashcard sets found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Reported Cards Table */}
      <h2>Reported Cards</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Flashcard Name</th>
            <th>Creator</th>
            <th>Reported By</th>
            <th>Reason</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reportedCards.length > 0 ? (
            reportedCards.map((report) => (
              <tr key={report.id}>
                <td>{report.id}</td>
                <td>{flashcardTitles[report.flashcardSetId] || "N/A"}</td>
                <td>{flashcardCreators[report.flashcardSetId] || "N/A"}</td>
                <td>{report.userName || "N/A"}</td>
                <td>{report.reasons.join(", ") || "N/A"}</td>
                <td>
                  <button
                    className="action-btn"
                    onClick={() => navigate(`/card/${report.flashcardSetId}`)} // Navigate to the reported card set
                  >
                    View
                  </button>
                  <button
                    className="action-btn"
                    onClick={
                      () =>
                        handleDeleteFlashcardSetAndReport(
                          report.flashcardSetId,
                          report.id
                        ) // Call the new delete function with flashcardSetId and reportId
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No reported cards found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Reported Comments Table */}
      <h2>Reported Comments</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Comment</th>
            <th>Reported By</th>
            <th>Reason</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reportedComments.length > 0 ? (
            reportedComments.map((report) => (
              <tr key={report.id}>
                <td>{report.id}</td>
                <td>{commentUsers[report.commentId] || "N/A"}</td>
                <td>{report.commentId || "N/A"}</td>
                <td>{report.userName || "N/A"}</td>
                <td>{report.reasons.join(", ") || "N/A"}</td>
                <td>
                  <button
                    className="action-btn"
                    onClick={
                      () =>
                        handleDeleteCommentAndReport(
                          report.commentId,
                          report.id
                        ) // Call the delete function
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No reported comments found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;
