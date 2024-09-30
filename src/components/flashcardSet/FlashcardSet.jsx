import React from "react";
import PropTypes from "prop-types";
import "./flashcardSet.css"; // Optional: Add styles for the FlashcardSet component

const FlashcardSet = ({ title, cardCount }) => {
  return (
    <div className="flashcard-set">
      <h2>{title}</h2>
      <p>Number of Cards: {cardCount}</p>
    </div>
  );
};

FlashcardSet.propTypes = {
  title: PropTypes.string.isRequired,
  cardCount: PropTypes.number.isRequired,
};

export default FlashcardSet;
