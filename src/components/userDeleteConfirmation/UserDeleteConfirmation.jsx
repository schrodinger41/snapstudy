// src/components/ConfirmationModal.js
import React from "react";
import "./userDeleteConfirmation.css"; // Optional: Add your CSS styles

const UserDeleteConfirmation = ({ onClose, onConfirm, userName }) => (
  <div className="custom-modal">
    <div className="modal-content">
      <h2>Confirm Deletion</h2>
      <p>
        Do you really want to delete user: <strong>{userName}</strong>?
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

export default UserDeleteConfirmation;
