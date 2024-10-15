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
    <div className="reported-comment-modal-overlay">
      <div className="reported-comment-modal-content">
        <h2 className="reported-comment-modal-title">Confirm Deletion</h2>
        <p className="reported-comment-modal-text">
          Are you sure you want to delete this reported comment?
        </p>
        <div className="reported-comment-modal-buttons">
          <button
            className="reported-comment-confirm-btn"
            onClick={() => {
              onConfirm(commentId, reportId);
              onClose();
            }}
          >
            Delete
          </button>
          <button className="reported-comment-cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportedCommentDeleteConfirmation;
