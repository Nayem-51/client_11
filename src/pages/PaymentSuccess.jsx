import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Lottie from "lottie-react";
import successAnimation from "../assets/animations/success.json";
import { useAuth } from "../hooks/useAuth";
import "./Pages.css";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    // Refresh user profile to get latest premium status
    refreshUser();

    // Simple progress bar for redirection
    const timer = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    const redirectTimer = setTimeout(() => {
      navigate("/dashboard");
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
    };
  }, [navigate, refreshUser]);

  return (
    <div className="page payment-result-page">
      <div className="result-card success-card">
        <div style={{ width: 150, margin: "0 auto" }}>
          <Lottie animationData={successAnimation} loop={false} />
        </div>
        <h1>Payment Successful!</h1>
        <p className="subtitle">
          Thank you for upgrading to Premium. You now have unlimited access to
          all life lessons.
        </p>

        <div className="redirect-status">
          <p>Redirecting to dashboard in a moment...</p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${percent}%` }}
            ></div>
          </div>
        </div>

        <div className="actions">
          <Link to="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
          <Link to="/lessons" className="btn btn-secondary">
            Browse Lessons
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
