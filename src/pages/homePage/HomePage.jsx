import React, { useEffect, useState } from "react";
import "./homepage.css";
import Navbar from "../../components/navbar/Navbar";
import { db } from "../../config/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import FlashcardSet from "../../components/flashcardSet/FlashcardSet";

const HomePage = () => {
  const [flashcardSets, setFlashcardSets] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "flashcards"), (snapshot) => {
      const sets = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(sets); // Log the fetched sets to debug
      setFlashcardSets(sets);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="home-page">
      <Navbar />
      <div className="flashcard-sets">
        {flashcardSets.map((set) => (
          <FlashcardSet
            key={set.id}
            title={set.title} // Check if title exists in the fetched data
            cardCount={set.cards.length} // Assuming 'cards' is an array in the set
          />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
