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
  updateDoc, // Import updateDoc to update documents
} from "firebase/firestore";
import Navbar from "../../components/navbar/Navbar";
import { FaTrash, FaEdit, FaEye, FaLock, FaUnlock } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Import the hook
import UserDeleteConfirmation from "../../components/userDeleteConfirmation/UserDeleteConfirmation";
import FlashcardDeleteConfirmation from "../../components/flashcardDeleteConfirmation/FlashcardDeleteConfirmation";
import ReportedCardDeleteConfirmation from "../../components/reportedCardDeleteConfirmation/ReportedCardDeleteConfirmation";
import ReportedCommentDeleteConfirmation from "../../components/reportedCommentDeleteConfirmation/ReportedCommentDeleteConfirmation";
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
  const [flashcardTitles, setFlashcardTitles] = useState({});
  const [commentTexts, setCommentTexts] = useState({}); // State for storing comment texts
  const [editingUserId, setEditingUserId] = useState(null); // State to track which user is being edited
  const [editableName, setEditableName] = useState(""); // State to store the name being edited
  const [editableRole, setEditableRole] = useState(""); // Store the editable user role
  const [editingFlashcardId, setEditingFlashcardId] = useState(null); // To track the flashcard being edited
  const [editableTitle, setEditableTitle] = useState(""); // Editable title
  const [editableDescription, setEditableDescription] = useState(""); // Editable description
  const [lockedStatus, setLockedStatus] = useState({}); // Track locked status of users

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [showFlashcardDeleteConfirmation, setShowFlashcardDeleteConfirmation] =
    useState(false);
  const [flashcardToDelete, setFlashcardToDelete] = useState(null);

  const [
    showReportedCardDeleteConfirmation,
    setShowReportedCardDeleteConfirmation,
  ] = useState(false);
  const [reportedCardToDelete, setReportedCardToDelete] = useState(null);

  const [
    showReportedCommentDeleteConfirmation,
    setShowReportedCommentDeleteConfirmation,
  ] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const navigate = useNavigate();

  // Fetch Users (updated to include locked status)
  useEffect(() => {
    const fetchUsers = () => {
      const usersRef = collection(db, "Users");
      const unsubscribe = onSnapshot(usersRef, (snapshot) => {
        const userData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userData);

        // Populate locked status
        const lockedMap = {};
        userData.forEach((user) => {
          lockedMap[user.id] = user.locked || false; // Default to false if no locked field
        });
        setLockedStatus(lockedMap);
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
    const fetchReportedComments = async () => {
      const reportCommentsRef = collection(db, "reportComments");
      const unsubscribe = onSnapshot(reportCommentsRef, async (snapshot) => {
        const reportedCommentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReportedComments(reportedCommentsData);

        const usersMap = {};
        const textsMap = {}; // Map to hold comment texts
        await Promise.all(
          reportedCommentsData.map(async (report) => {
            const commentRef = doc(db, "comments", report.commentId);
            const commentSnap = await getDoc(commentRef);
            if (commentSnap.exists()) {
              usersMap[report.commentId] = commentSnap.data().userName || "N/A";
              textsMap[report.commentId] = commentSnap.data().text || "N/A"; // Fetch comment text
            }
          })
        );
        setCommentUsers(usersMap);
        setCommentTexts(textsMap); // Store the comment texts in state
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
  const handleDeleteFlashcardSet = (id, title) => {
    setFlashcardToDelete({ id, title });
    setShowFlashcardDeleteConfirmation(true);
  };

  const handleConfirmDeleteFlashcardSet = async () => {
    if (flashcardToDelete) {
      try {
        const flashcardDoc = doc(db, "flashcards", flashcardToDelete.id);
        await deleteDoc(flashcardDoc);
        console.log("Flashcard set deleted successfully.");
      } catch (error) {
        console.error("Error deleting flashcard set: ", error);
      } finally {
        setFlashcardToDelete(null); // Clear the flashcard to delete
        setShowFlashcardDeleteConfirmation(false); // Close the confirmation popup
      }
    }
  };

  // Delete User
  const handleDeleteUser = (id, name) => {
    setUserToDelete({ id, name });
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        const userDoc = doc(db, "Users", userToDelete.id);
        await deleteDoc(userDoc);
        console.log("User deleted successfully.");
      } catch (error) {
        console.error("Error deleting user: ", error);
      } finally {
        setUserToDelete(null); // Clear the user to delete
        setShowDeleteConfirmation(false); // Close the confirmation popup
      }
    }
  };

  // Handle delete confirmation for reported cards
  const handleDeleteReportedCard = (id, title, flashcardSetId) => {
    setReportedCardToDelete({ id, title, flashcardSetId }); // Include flashcardSetId
    setShowReportedCardDeleteConfirmation(true);
  };

  const handleConfirmDeleteReportedCard = async () => {
    if (reportedCardToDelete) {
      try {
        // Delete the report from reportSets
        const reportDoc = doc(db, "reportSets", reportedCardToDelete.id);
        await deleteDoc(reportDoc);
        console.log("Reported card deleted successfully.");

        // Delete the associated flashcard set
        const flashcardDoc = doc(
          db,
          "flashcards",
          reportedCardToDelete.flashcardSetId
        );
        await deleteDoc(flashcardDoc);
        console.log("Flashcard set deleted successfully.");
      } catch (error) {
        console.error(
          "Error deleting reported card and flashcard set: ",
          error
        );
      } finally {
        setReportedCardToDelete(null); // Clear the card to delete
        setShowReportedCardDeleteConfirmation(false); // Close the confirmation popup
      }
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

  // Start editing a user's name
  const handleEditUser = (userId, name, role) => {
    setEditingUserId(userId);
    setEditableName(name);
    setEditableRole(role); // Set the initial role for editing
  };

  // Save the edited user name and role
  const handleSaveUserName = async (userId) => {
    try {
      const userDoc = doc(db, "Users", userId);
      await updateDoc(userDoc, {
        fullName: editableName,
        role: editableRole, // Update the role in Firestore
      });
      console.log("User name and role updated successfully.");
    } catch (error) {
      console.error("Error updating user: ", error);
    } finally {
      setEditingUserId(null); // Reset editing state
      setEditableName(""); // Clear name input
      setEditableRole(""); // Clear role selection
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditableName("");
    setEditableRole("");
  };

  // Handle Edit for Flashcard Set
  const handleEditFlashcardSet = (flashcard) => {
    setEditingFlashcardId(flashcard.id); // Set the flashcard being edited
    setEditableTitle(flashcard.title); // Set initial editable title
    setEditableDescription(flashcard.description); // Set initial editable description
  };

  // Handle Save for Flashcard Set
  const handleSaveFlashcardSet = async (flashcardId) => {
    try {
      const flashcardDoc = doc(db, "flashcards", flashcardId);
      await updateDoc(flashcardDoc, {
        title: editableTitle, // Save the updated title
        description: editableDescription, // Save the updated description
      });
      console.log("Flashcard set updated successfully.");
    } catch (error) {
      console.error("Error updating flashcard set: ", error);
    } finally {
      setEditingFlashcardId(null); // Reset editing state
      setEditableTitle(""); // Clear editable title
      setEditableDescription(""); // Clear editable description
    }
  };

  // Cancel editing
  const handleCancelEditFlashcardSet = () => {
    setEditingFlashcardId(null); // Reset editing state
    setEditableTitle(""); // Clear editable title
    setEditableDescription(""); // Clear editable description
  };

  // Function to lock/unlock a user
  const handleLockUnlockUser = async (userId, currentStatus) => {
    try {
      const userDoc = doc(db, "Users", userId);
      await updateDoc(userDoc, {
        locked: !currentStatus, // Toggle lock status
      });
      console.log(
        `User ${!currentStatus ? "locked" : "unlocked"} successfully.`
      );
    } catch (error) {
      console.error("Error locking/unlocking user: ", error);
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
            <th>Role</th>
            <th className="center-text">Card Sets Created</th>
            <th className="center-text">Number of Comments</th>
            <th className="center-text">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>
                {editingUserId === user.id ? (
                  <input
                    type="text"
                    value={editableName}
                    maxLength={50}
                    onChange={(e) => setEditableName(e.target.value)}
                    className="edit-input-field"
                  />
                ) : (
                  user.fullName
                )}
              </td>
              <td>{user.email || "N/A"}</td>
              <td>
                {editingUserId === user.id ? (
                  <select
                    value={editableRole}
                    onChange={(e) => setEditableRole(e.target.value)}
                    className="edit-input-field"
                  >
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                ) : (
                  user.role || "N/A"
                )}
              </td>
              <td className="center-text">{flashcardCounts[user.id] || 0}</td>
              <td className="center-text">{commentsCount[user.id] || 0}</td>
              <td className="center-text">
                {editingUserId === user.id ? (
                  <>
                    <button
                      onClick={() => handleSaveUserName(user.id)}
                      className="save-edit-btn"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="cancel-edit-btn"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <div className="button-container">
                    <button
                      onClick={() =>
                        handleEditUser(user.id, user.fullName, user.role)
                      }
                      className="edit-btn"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.fullName)}
                      className="delete-btn"
                    >
                      <FaTrash />
                    </button>
                    <button
                      onClick={() =>
                        handleLockUnlockUser(user.id, lockedStatus[user.id])
                      }
                      className={
                        lockedStatus[user.id] ? "unlock-btn" : "lock-btn"
                      }
                    >
                      {lockedStatus[user.id] ? <FaLock /> : <FaUnlock />}
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Confirmation Popup */}
      {showDeleteConfirmation && (
        <UserDeleteConfirmation
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={handleConfirmDelete}
          userName={userToDelete.name}
        />
      )}

      {/* Flashcard Sets Table */}
      <h2>Flashcard Sets</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th className="center-text">Creator</th>
            <th>Play Count</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {flashcardSets.length > 0 ? (
            flashcardSets.map((set) => (
              <tr key={set.id}>
                <td>{set.id}</td>
                <td>
                  {editingFlashcardId === set.id ? (
                    <input
                      type="text"
                      value={editableTitle}
                      maxLength={40}
                      onChange={(e) => setEditableTitle(e.target.value)}
                      className="edit-input-field"
                    />
                  ) : (
                    set.title || "N/A"
                  )}
                </td>
                <td>
                  {editingFlashcardId === set.id ? (
                    <input
                      type="text"
                      maxLength={100}
                      value={editableDescription}
                      onChange={(e) => setEditableDescription(e.target.value)}
                      className="edit-input-field"
                    />
                  ) : (
                    set.description || "N/A"
                  )}
                </td>
                <td>{set.creator || "N/A"}</td>
                <td>{set.completedUsers || 0}</td>
                <td>
                  {editingFlashcardId === set.id ? (
                    <>
                      <button
                        className="save-edit-btn"
                        onClick={() => handleSaveFlashcardSet(set.id)}
                      >
                        Save
                      </button>
                      <button
                        className="cancel-edit-btn"
                        onClick={handleCancelEditFlashcardSet}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <div className="button-container">
                      <button
                        className="view-btn"
                        onClick={() => navigate(`/card/${set.id}`)} // Navigate to the CardPage with the flashcard set ID
                      >
                        <FaEye />
                      </button>
                      <button
                        className="edit-btn"
                        onClick={() => handleEditFlashcardSet(set)} // Call edit function
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() =>
                          handleDeleteFlashcardSet(set.id, set.title)
                        } // Call delete function with title
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
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

      {/* Confirmation Popup for Flashcard Deletion */}
      {showFlashcardDeleteConfirmation && (
        <FlashcardDeleteConfirmation
          onClose={() => setShowFlashcardDeleteConfirmation(false)}
          onConfirm={handleConfirmDeleteFlashcardSet}
          flashcardTitle={flashcardToDelete.title}
        />
      )}

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
                  <div className="button-container">
                    <button
                      className="view-btn"
                      onClick={() => navigate(`/card/${report.flashcardSetId}`)} // Navigate to the reported card set
                    >
                      <FaEye />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() =>
                        handleDeleteReportedCard(
                          report.id,
                          flashcardTitles[report.flashcardSetId],
                          report.flashcardSetId
                        )
                      } // Ensure flashcardSetId is passed
                    >
                      <FaTrash />
                    </button>
                  </div>
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

      {/* Reported Card Delete Confirmation Popup */}
      {showReportedCardDeleteConfirmation && (
        <ReportedCardDeleteConfirmation
          title={reportedCardToDelete.title}
          onConfirm={handleConfirmDeleteReportedCard}
          onCancel={() => setShowReportedCardDeleteConfirmation(false)}
        />
      )}

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
                <td>{commentTexts[report.commentId] || "N/A"}</td>
                <td>{report.userName || "N/A"}</td>
                <td>{report.reasons.join(", ") || "N/A"}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => {
                      setCommentToDelete({
                        commentId: report.commentId,
                        reportId: report.id,
                      });
                      setShowReportedCommentDeleteConfirmation(true);
                    }}
                  >
                    <FaTrash />
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

      {/* Reported Comment Delete Confirmation Popup */}
      <ReportedCommentDeleteConfirmation
        isOpen={showReportedCommentDeleteConfirmation}
        onClose={() => setShowReportedCommentDeleteConfirmation(false)}
        onConfirm={(commentId, reportId) =>
          handleDeleteCommentAndReport(commentId, reportId)
        }
        commentId={commentToDelete?.commentId}
        reportId={commentToDelete?.reportId}
      />
    </div>
  );
};

export default AdminPage;
