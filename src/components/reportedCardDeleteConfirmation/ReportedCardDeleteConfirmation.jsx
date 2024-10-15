// ReportedCardDeleteConfirmation.jsx
import React from "react";
import "./reportedCardDeleteConfirmation.css"; // Ensure to style the component

const ReportedCardDeleteConfirmation = ({ title, onConfirm, onCancel }) => {
  return (
    <div className="confirmation-popup">
      <h3>Confirm Deletion</h3>
      <p>Are you sure you want to delete the reported card "{title}"?</p>
      <div className="confirmation-buttons">
        <button onClick={onConfirm} className="confirm-btn">
          Delete
        </button>
        <button onClick={onCancel} className="cancel-btn">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ReportedCardDeleteConfirmation;
