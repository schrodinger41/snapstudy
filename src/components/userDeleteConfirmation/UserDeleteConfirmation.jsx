// src/components/ConfirmationModal.js
import React from "react";
import "./userDeleteConfirmation.css"; // Optional: Add your CSS styles

const UserDeleteConfirmation = ({ onClose, onConfirm, userName }) => (
  <div className="confirmation-popup">
    <h2>Confirm Deletion</h2>
    <p>
      Do you really want to delete user: <strong>{userName}</strong>?
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

export default UserDeleteConfirmation;
