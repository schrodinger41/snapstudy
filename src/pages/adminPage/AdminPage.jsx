// pages/adminPage/AdminPage.js
import React, { useEffect, useState } from "react";
import { db } from "../../config/firebase"; // Ensure you have this import
import { collection, onSnapshot, query, where } from "firebase/firestore";
import Navbar from "../../components/navbar/Navbar";
import "./adminPage.css";

const AdminPage = () => {
  const [users, setUsers] = useState([]); // State to hold user data
  const [flashcardCounts, setFlashcardCounts] = useState({}); // State to hold flashcard counts

  useEffect(() => {
    const fetchUsers = () => {
      const usersRef = collection(db, "Users"); // Reference to the Users collection
      const unsubscribe = onSnapshot(usersRef, (snapshot) => {
        const userData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userData); // Update state with fetched user data
      });

      return () => unsubscribe(); // Cleanup on unmount
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchFlashcardCounts = () => {
      const flashcardsRef = collection(db, "flashcards"); // Reference to the flashcards collection
      const counts = {}; // Object to hold counts

      users.forEach((user) => {
        const q = query(flashcardsRef, where("uid", "==", user.id)); // Query to count flashcards by user UID
        const unsubscribe = onSnapshot(q, (snapshot) => {
          counts[user.id] = snapshot.docs.length; // Count the number of flashcards for each user
          setFlashcardCounts({ ...counts }); // Update flashcard counts state
        });

        return () => unsubscribe(); // Cleanup on unmount for each user
      });
    };

    if (users.length > 0) {
      fetchFlashcardCounts();
    }
  }, [users]);

  return (
    <div>
      <Navbar />
      <h1>Admin Dashboard</h1>
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
                <td>{user.fullName || "N/A"}</td> <td>{user.email || "N/A"}</td>{" "}
                <td>{flashcardCounts[user.id] || 0}</td>{" "}
                <td>{user.commentsCount || 0}</td>{" "}
                <td>
                  <button className="action-btn">Edit</button>
                  <button className="action-btn">Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No users found.</td> {/* Adjusted column span */}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;
