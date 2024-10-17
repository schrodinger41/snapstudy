import React from "react";
import "./flashcardDeleteConfirmation.css";

const FlashcardDeleteConfirmation = ({
  onClose,
  onConfirm,
  flashcardTitle,
}) => (
  <div className="custom-modal">
    <div className="modal-content">
      <h2>Confirm Deletion</h2>
      <p>
        Do you really want to delete flashcard set:{" "}
        <strong>{flashcardTitle}</strong>?
      </p>
      <div className="confirmation-buttons">
        <button onClick={onConfirm} className="cancel-button">
          Delete
        </button>
        <button onClick={onClose} className="cancel-button">
          Cancel
        </button>
      </div>
    </div>
  </div>
);

export default FlashcardDeleteConfirmation;
