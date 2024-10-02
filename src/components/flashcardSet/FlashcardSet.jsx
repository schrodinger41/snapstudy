import React from "react";
import PropTypes from "prop-types";
import { TbCardsFilled } from "react-icons/tb";
import "./flashcardSet.css";

const FlashcardSet = ({ title, cardCount }) => {
  return (
    <div className="flashcard-set">
      <div className="flashcard-content">
        <h2>{title}</h2>
      </div>
      <div className="flashcard-footer">
        <p>{cardCount} cards</p>
        <TbCardsFilled className="card-icon" />
      </div>
    </div>
  );
};

FlashcardSet.propTypes = {
  title: PropTypes.string.isRequired,
  cardCount: PropTypes.number.isRequired,
};

export default FlashcardSet;
