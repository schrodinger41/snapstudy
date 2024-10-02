import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./homepage.css";
import Navbar from "../../components/navbar/Navbar";
import { db } from "../../config/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import FlashcardSet from "../../components/flashcardSet/FlashcardSet";
import { FaRegFolderOpen } from "react-icons/fa6";

const HomePage = () => {
  const [flashcardSets, setFlashcardSets] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "flashcards"), (snapshot) => {
      const sets = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFlashcardSets(sets);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="home-page">
      <Navbar />
      <div className="home-page-content">
        <div className="top">
          <div className="top-container">
            <div className="top-left">
              <div className="top-text">Pick a set to practice!</div>
            </div>
            <div className="top-right">
              <div className="add-set-button">
                <Link to="/newCard">
                  <FaRegFolderOpen className="set-button" />
                  <span className="tooltip-text">Add new set?</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="bottom">
          <div className="flashcard-sets">
            {flashcardSets.map((set) => (
              <FlashcardSet
                key={set.id}
                title={set.title}
                cardCount={set.cards.length}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
