import React, { useState } from "react";
import "./newcardpage.css";
import Navbar from "../../components/navbar/Navbar";
import { FaTrash, FaPlus, FaImage } from "react-icons/fa"; // Import icons

const NewCardPage = () => {
  const [cards, setCards] = useState([{ term: "", definition: "" }]);

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

  return (
    <div className="newcard-page">
      <Navbar />
      <div className="flashcard-container">
        <h1>Create a new flashcard set</h1>

        <div className="flashcard-header">
          <div className="flashcard-input">
            <label>Title</label>
            <input type="text" placeholder="Add a title (e.g. Death)" />
          </div>
          <div className="flashcard-input">
            <label>Description</label>
            <textarea placeholder="Add a description..."></textarea>
          </div>
          <div className="flashcard-image">
            <button>
              <FaImage /> IMAGE
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
                  <FaTrash /> {/* Trash icon */}
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

        <div className="flashcard-actions">
          <button className="create-btn">Create</button>
          <button className="create-practice-btn">Create and Practice</button>
        </div>
      </div>
    </div>
  );
};

export default NewCardPage;
