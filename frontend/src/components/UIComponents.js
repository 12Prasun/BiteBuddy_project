import React from 'react';

// Loading Spinner Component
export const LoadingSpinner = ({ fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center my-3">
      <div className="spinner-border spinner-border-sm text-success" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

// Error Message Component
export const ErrorMessage = ({ message, onDismiss }) => {
  return (
    <div className="alert alert-danger alert-dismissible fade show" role="alert">
      <strong>Error:</strong> {message}
      {onDismiss && (
        <button 
          type="button" 
          className="btn-close" 
          data-bs-dismiss="alert" 
          aria-label="Close"
          onClick={onDismiss}
        ></button>
      )}
    </div>
  );
};

// Success Message Component
export const SuccessMessage = ({ message, onDismiss }) => {
  return (
    <div className="alert alert-success alert-dismissible fade show" role="alert">
      <strong>Success!</strong> {message}
      {onDismiss && (
        <button 
          type="button" 
          className="btn-close" 
          data-bs-dismiss="alert" 
          aria-label="Close"
          onClick={onDismiss}
        ></button>
      )}
    </div>
  );
};

// Empty State Component
export const EmptyState = ({ title = "No items found", message = "Try adjusting your search filters." }) => {
  return (
    <div className="text-center my-5">
      <div className="mb-3">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      </div>
      <h5>{title}</h5>
      <p className="text-muted">{message}</p>
    </div>
  );
};
