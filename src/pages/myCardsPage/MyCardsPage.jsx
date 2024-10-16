import React, { useEffect, useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import { db } from "../../config/firebase"; 
import { collection, query, where, onSnapshot } from "firebase/firestore";
import FlashcardSet from "../../components/flashcardSet/FlashcardSet";
import { FaRegFolderOpen } from 'react-icons/fa6';
import { useNavigate } from "react-router-dom"; 
import "./myCardsPage.css";

const MyCardsPage = () => {
  const [userCards, setUserCards] = useState([]);
  const userUID = localStorage.getItem("userUID"); 
  const navigate = useNavigate(); 

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

        return () => unsubscribe();
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
      <div className="my-cards-page">
      <div className="header-container">
        <h1>My Flashcards</h1>
        <div className="new-card-container">
          <button onClick={handleNavigateToNewCardPage} className="new-card-btn">
            <FaRegFolderOpen />
          </button>
          <div className="tooltip">Add new set?</div>
        </div>
      </div>
      <div className="my-flashcard-container">
          <div className="flashcard-sets">
            {userCards.length > 0 ? (
              userCards.map((card) => (
                <FlashcardSet
                  key={card.id}
                  id={card.id}
                  title={card.title}
                  creator={card.creator}
                  cardCount={card.cards.length}
                  completedUsers={card.completedUsers || 0}
                />
              ))
            ) : (
              <p>No flashcards created yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCardsPage;
