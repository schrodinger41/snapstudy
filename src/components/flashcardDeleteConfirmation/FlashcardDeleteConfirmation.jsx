import React from "react";
import "./flashcardDeleteConfirmation.css";

const FlashcardDeleteConfirmation = ({
  onClose,
  onConfirm,
  flashcardTitle,
}) => (
  <div className="confirmation-popup">
    <h2>Confirm Deletion</h2>
    <p>
      Do you really want to delete flashcard set:{" "}
      <strong>{flashcardTitle}</strong>?
    </p>
    <div className="confirmation-buttons">
      <button onClick={onConfirm} className="confirm-btn">
        Delete
      </button>
      <button onClick={onClose} className="cancel-btn">
        Cancel
      </button>
    </div>
  </div>
);

export default FlashcardDeleteConfirmation;
