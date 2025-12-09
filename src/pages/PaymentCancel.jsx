import React from "react";
import { Link } from "react-router-dom";
import "./Pages.css";

const PaymentCancel = () => {
  return (
    <div className="page">
      <section className="guarantee-card" style={{ marginTop: 32 }}>
        <h2>Payment canceled</h2>
        <p>
          Your Stripe checkout was canceled or failed. You have not been charged. You can
          try again anytime to upgrade to Premium.
        </p>
        <div className="cta-buttons" style={{ justifyContent: "flex-start" }}>
          <Link to="/pricing" className="btn btn-primary">
            Go back to Pricing
          </Link>
          <Link to="/dashboard" className="btn btn-secondary">
            Return to Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
};

export default PaymentCancel;
