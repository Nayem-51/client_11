import React from "react";
import { Link } from "react-router-dom";
import "./Pages.css";

const PaymentCancel = () => {
  return (
    <div className="page payment-page">
      <div className="payment-card cancel-card">
        <div className="icon-wrapper cancel-icon">
          <span>✕</span>
        </div>
        <h1>Payment Canceled</h1>
        <p>
          Your payment was canceled or did not complete. No charges were made to
          your card.
        </p>
        <div className="action-buttons">
          <Link to="/pricing" className="btn btn-primary">
            Try Again
          </Link>
          <Link to="/dashboard" className="btn btn-secondary">
            Go to Dashboard
          </Link>
        </div>
        <p className="help-text">
          If you continue to experience issues, please contact support.
        </p>
      </div>
    </div>
  );
};

export default PaymentCancel;
