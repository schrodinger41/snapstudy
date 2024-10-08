// components/cardPage/CardPage.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Import useParams
import { db } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "../../components/navbar/Navbar";
import "./cardPage.css";

const CardPage = () => {
  const { id } = useParams(); // Get the card id from the URL
  const [flashcardSet, setFlashcardSet] = useState(null); // State to hold the flashcard set

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

  if (!flashcardSet) return <div>Loading...</div>; // Loading state

  return (
    <div className="card-page">
      <Navbar />
      <h2>{flashcardSet.title}</h2>
      <p>Created by: {flashcardSet.creator}</p>
      <p>{flashcardSet.cards.length} cards available</p>
      {/* Add more details as needed */}
    </div>
  );
};

export default CardPage;
