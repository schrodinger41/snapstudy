import React, { useEffect, useState } from "react";
import { db } from "../../config/firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import Navbar from "../../components/navbar/Navbar";
import { useNavigate } from "react-router-dom"; // Import the hook
import "./adminPage.css";

const AdminPage = () => {
  const [users, setUsers] = useState([]); // State to hold user data
  const [flashcardCounts, setFlashcardCounts] = useState({}); // State to hold flashcard counts
  const [commentsCount, setCommentsCount] = useState({}); // State to hold comment counts per user
  const [flashcardSets, setFlashcardSets] = useState([]); // State to hold flashcard sets
  const navigate = useNavigate(); // Use navigate hook

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
    </div>
  );
};

export default AdminPage;
