// src/components/reportedCommentDeleteConfirmation/ReportedCommentDeleteConfirmation.jsx
import React from "react";
import "./reportedCommentDeleteConfirmation.css"; // Ensure you have styles for the modal

const ReportedCommentDeleteConfirmation = ({
  isOpen,
  onClose,
  onConfirm,
  commentId,
  reportId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="custom-modal">
      <div className="modal-content">
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete this reported comment?</p>
        <div className="confirmation-buttons">
          <button
            className="cancel-button"
            onClick={() => {
              onConfirm(commentId, reportId);
              onClose();
            }}
          >
            Delete
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportedCommentDeleteConfirmation;
