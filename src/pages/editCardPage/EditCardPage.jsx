import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import { FaTrash, FaPlus } from "react-icons/fa";
import { db } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import "./editFlashcard.css";

const EditCardPage = () => {
  const { id } = useParams(); 
  const [cards, setCards] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlashcardSet = async () => {
      if (user) {
        try {
          const flashcardDoc = await getDoc(doc(db, "flashcards", id));
          if (flashcardDoc.exists()) {
            const data = flashcardDoc.data();
            setTitle(data.title);
            setDescription(data.description);
            setCategory(data.category);
            setCards(data.cards);
          }
        } catch (error) {
          console.error("Error fetching flashcard set: ", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchFlashcardSet();
  }, [id, user]);

  const handleInputChange = (index, field, value) => {
    const updatedCards = [...cards];
    updatedCards[index][field] = value;
    setCards(updatedCards);
  };

  const addCard = () => {
    setCards([...cards, { term: "", definition: "" }]);
  };

  const removeCard = (index) => {
    const updatedCards = cards.filter((_, i) => i !== index);
    setCards(updatedCards);
  };

  const saveFlashcardSet = async () => {
    if (cards.length < 4) {
      setError("You must have at least 4 cards.");
      return;
    }

    try {
      const flashcardSet = {
        title,
        description,
        category,
        cards,
      };

      // Update the flashcard set in Firestore
      await updateDoc(doc(db, "flashcards", id), flashcardSet);

      setError(""); // Clear any error

      // Navigate to the specific card page after saving
      navigate(`/card/${id}`);
    } catch (error) {
      console.error("Error saving flashcard set: ", error);
    }
  };

  const cancelEdit = () => {
    navigate(`/card/${id}`); // Navigate back to the card page without saving
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="newcard-page">
      <Navbar />
      <div className="flashcard-container">
        <h1>Edit Flashcard Set</h1>

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
            <button className="cancelEdit" onClick={cancelEdit}>
              Cancel
            </button>
            <button className="create-practice-btn" onClick={saveFlashcardSet}>
              Save
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

export default EditCardPage;
