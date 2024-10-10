import React, { useEffect, useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import { db } from "../../config/firebase"; // Ensure you have this import
import { collection, query, where, onSnapshot } from "firebase/firestore";
import FlashcardSet from "../../components/flashcardSet/FlashcardSet"; // Import the FlashcardSet component
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./myCardsPage.css";

const MyCardsPage = () => {
  const [userCards, setUserCards] = useState([]);
  const userUID = localStorage.getItem("userUID"); // Retrieve UID from local storage
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchUserCards = () => {
      if (userUID) {
        const q = query(
          collection(db, "flashcards"),
          where("uid", "==", userUID)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const cardsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUserCards(cardsData);
        });

        return () => unsubscribe(); // Cleanup on unmount
      }
    };

    fetchUserCards();
  }, [userUID]);

  // Navigate to New Card Page
  const handleNavigateToNewCardPage = () => {
    navigate("/newCard");
  };

  return (
    <div>
      <Navbar />
      <h1>My Flashcards</h1>
      <button onClick={handleNavigateToNewCardPage} className="new-card-btn">
        Create New Flashcard
      </button>
      <div className="my-cards-container">
        {userCards.length > 0 ? (
          userCards.map((card) => (
            <FlashcardSet
              key={card.id}
              id={card.id}
              title={card.title}
              creator={card.creator}
              cardCount={card.cards.length}
              completedUsers={card.completedUsers || 0} // Adjust this based on your data structure
            />
          ))
        ) : (
          <p>No flashcards created yet.</p>
        )}
      </div>
    </div>
  );
};

export default MyCardsPage;
