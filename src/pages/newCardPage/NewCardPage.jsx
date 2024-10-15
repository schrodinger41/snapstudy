import React, { useState, useEffect } from "react";
import "./newcardpage.css";
import Navbar from "../../components/navbar/Navbar";
import { FaTrash, FaPlus } from "react-icons/fa";
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
  const [category, setCategory] = useState(""); // State for category
  const [error, setError] = useState(""); // State for error message
  const auth = getAuth();
  const user = auth.currentUser; // Get the current user
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
        setError("You must create at least 4 cards.");
        return;
      } else {
        setError("");
      }

      try {
        const flashcardSet = {
          title,
          description,
          category, // Save category
          uid: user.uid,
          creator: user.displayName || "Anonymous", // Save the user's display name
          cards: cards,
        };
        await addDoc(collection(db, "flashcards"), flashcardSet);
        setCards([{ term: "", definition: "" }]);
        setTitle("");
        setDescription("");
        setCategory(""); // Clear category after saving
        navigate("/home");
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

        {error && <div className="error-message">{error}</div>}

        <div className="flashcard-header">
          <div className="flashcard-input">
            <input
              type="text"
              placeholder="Add a title (e.g. Biology Basics)"
              value={title}
              maxLength={40}
              onChange={(e) => setTitle(e.target.value)}
            />
            <label>Title</label>

            <textarea
              placeholder="Add a description..."
              value={description}
              maxLength={100}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
            <label>Description</label>

            {/* Category Selection */}
            <select
              className="select-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="" disabled>
                Select a category
              </option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="History">History</option>
              <option value="Languages">Languages</option>
              <option value="Social Studies">Social Studies</option>
              <option value="Literature">Literature</option>
              <option value="Medical Studies">Medical Studies</option>
              <option value="Business & Economics">Business & Economics</option>
              <option value="Technology & Computer Science">
                Technology & Computer Science
              </option>
              <option value="Art & Music">Art & Music</option>
              <option value="Other">Other</option>
            </select>
            <label>Category</label>
          </div>
          <div className="flashcard-actions">
            <button
              className="create-practice-btn"
              onClick={createFlashcardSet}
            >
              Create
            </button>
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
                <div className="flashcard-input">
                  <input
                    type="text"
                    placeholder="Enter term"
                    value={card.term}
                    maxLength={100}
                    onChange={(e) =>
                      handleInputChange(index, "term", e.target.value)
                    }
                  />
                  <label>Term</label>
                </div>
                <div className="flashcard-input">
                  <input
                    type="text"
                    placeholder="Enter definition"
                    maxLength={100}
                    value={card.definition}
                    onChange={(e) =>
                      handleInputChange(index, "definition", e.target.value)
                    }
                  />
                  <label>Definition</label>
                </div>
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
