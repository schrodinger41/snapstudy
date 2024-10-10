// components/flashcardSet/FlashcardSet.js
import React from "react";
import PropTypes from "prop-types";
import { TbCardsFilled } from "react-icons/tb";
import { Link } from "react-router-dom"; // Import Link
import "./flashcardSet.css";

const FlashcardSet = ({ title, cardCount, creator, id, completedUsers }) => {
  return (
    <Link to={`/card/${id}`} className="flashcard-set">
      {" "}
      {/* Add Link for navigation */}
      <div className="flashcard-content">
        <h2>{title}</h2>
        <p>Created by: {creator}</p> {/* Display creator's name */}
      </div>
      <div className="flashcard-footer">
        <div className="flashcard-footer-left">
          <p>{completedUsers} plays</p>
        </div>
        
        <div className="flashcard-footer-right">
          <p>{cardCount} cards</p>
          <TbCardsFilled className="card-icon" />
        </div>
      </div>
    </Link>
  );
};

FlashcardSet.propTypes = {
  title: PropTypes.string.isRequired,
  cardCount: PropTypes.number.isRequired,
  creator: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  completedUsers: PropTypes.number.isRequired, // Add completedUsers prop
};

export default FlashcardSet;
