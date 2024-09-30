import React, { useState, useEffect } from "react";
import "./newcardpage.css";
import Navbar from "../../components/navbar/Navbar";
import { FaTrash, FaPlus, FaImage } from "react-icons/fa";
import { db } from "../../config/firebase";
import { getAuth } from "firebase/auth";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const NewCardPage = () => {
  const [cards, setCards] = useState([
    { term: "", definition: "" },
    { term: "", definition: "" },
    { term: "", definition: "" },
    { term: "", definition: "" },
  ]);
  const [userCards, setUserCards] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(""); // State for error message
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, "flashcards"),
        where("uid", "==", user.uid)
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
  }, [user]);

  const addCard = () => {
    setCards([...cards, { term: "", definition: "" }]);
  };

  const removeCard = (index) => {
    const updatedCards = cards.filter((_, i) => i !== index);
    setCards(updatedCards);
  };

  const handleInputChange = (index, field, value) => {
    const updatedCards = [...cards];
    updatedCards[index][field] = value;
    setCards(updatedCards);
  };

  const createFlashcardSet = async () => {
    if (user) {
      if (cards.length < 4) {
        setError("You must create at least 4 cards."); // Set error message
        return; // Prevent further execution
      } else {
        setError(""); // Clear error message if valid
      }

      try {
        const flashcardSet = {
          title,
          description,
          uid: user.uid,
          cards: cards,
        };
        await addDoc(collection(db, "flashcards"), flashcardSet);
        setCards([{ term: "", definition: "" }]); // Clear cards after saving
        setTitle(""); // Clear title after saving
        setDescription(""); // Clear description after saving
        navigate("/home"); // Navigate to the homepage after creating
      } catch (error) {
        console.error("Error creating flashcard set: ", error);
      }
    } else {
      console.error("User is not authenticated.");
    }
  };

  return (
    <div className="newcard-page">
      <Navbar />
      <div className="flashcard-container">
        <h1>Create a new flashcard set</h1>

        {/* Display error message if any */}
        {error && <div className="error-message">{error}</div>}

        <div className="flashcard-header">
          <div className="flashcard-input">
            
            <input
              type="text"
              placeholder="Add a title (e.g. Death)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <label>Title</label>
            
            <textarea
              placeholder="Add a description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
            <label>Description</label>
          </div>
          <div className="flashcard-image">
            <button>
              <FaImage /> IMAGE
            </button>
          </div>
          <div className="flashcard-actions">
            <button className="create-btn" onClick={createFlashcardSet}>
              Create
            </button>
            <button className="create-practice-btn">Create and Practice</button>
          </div>
        </div>       
        <div className="flashcard-cards">
          {cards.map((card, index) => (
            <div key={index} className="card">
              <div className="card-header">
                <span>{index + 1}</span>
                <button
                  onClick={() => removeCard(index)}
                  className="remove-btn"
                >
                  <FaTrash />
                </button>
              </div>
              <div className="card-body">
                <input
                  type="text"
                  placeholder="Enter term"
                  value={card.term}
                  onChange={(e) =>
                    handleInputChange(index, "term", e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="Enter definition"
                  value={card.definition}
                  onChange={(e) =>
                    handleInputChange(index, "definition", e.target.value)
                  }
                />
                <button className="add-image-btn">
                  <FaImage /> IMAGE
                </button>
              </div>
            </div>
          ))}
          <button onClick={addCard} className="add-card-btn">
            <FaPlus /> Add Card
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewCardPage;
