// ReportedCardDeleteConfirmation.jsx
import React from "react";
import "./reportedCardDeleteConfirmation.css"; // Ensure to style the component

const ReportedCardDeleteConfirmation = ({ title, onConfirm, onCancel }) => {
  return (
    <div className="custom-modal">
      <div className="modal-content">
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete the reported card <strong>"{title}"</strong>?</p>
        <div className="confirmation-buttons">
          <button onClick={onConfirm} className="cancel-button">
            Delete
          </button>
          <button onClick={onCancel} className="cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportedCardDeleteConfirmation;
