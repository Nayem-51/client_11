import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Lottie from "lottie-react";
import successAnimation from "../assets/animations/success.json";
import { useAuth } from "../hooks/useAuth";
import "./Pages.css";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [percent, setPercent] = useState(0);
  const [syncing, setSyncing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const syncPremiumStatus = async () => {
      try {
        console.log("🔄 Starting premium status sync...");
        console.log("Current user before refresh:", {
          email: user?.email,
          isPremium: user?.isPremium,
        });

        // Multiple refresh attempts to ensure webhook has processed
        for (let i = 0; i < 3; i++) {
          await refreshUser();
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Check localStorage for updated user
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser?.isPremium) {
              console.log("✅ Premium status confirmed!");
              break;
            }
          }
        }

        if (isMounted) {
          setSyncing(false);
          console.log("✅ Premium status synced and component updated");
        }
      } catch (error) {
        console.error("❌ Failed to sync premium status:", error.message);
        if (isMounted) {
          setSyncing(false);
        }
      }
    };

    // Wait 2 seconds for webhook to process, then sync
    const timer = setTimeout(() => {
      syncPremiumStatus();
    }, 2000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [refreshUser]);

  useEffect(() => {
    if (!syncing) {
      // Progress bar for redirection
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
    }
  }, [navigate, syncing]);

  return (
    <div className="page payment-result-page">
      <div className="result-card success-card">
        <div style={{ width: 150, margin: "0 auto" }}>
          <Lottie animationData={successAnimation} loop={false} />
        </div>
        <h1>Payment Successful! 🎉</h1>
        <p className="subtitle">
          {syncing
            ? "Processing your premium upgrade..."
            : "Thank you for upgrading to Premium. You now have unlimited access to all life lessons."}
        </p>

        <div className="redirect-status">
          <p>
            {syncing
              ? "Verifying your premium status..."
              : "Redirecting to dashboard in a moment..."}
          </p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${percent}%` }}
            ></div>
          </div>
        </div>

        {!syncing && (
          <div className="actions">
            <Link to="/dashboard" className="btn btn-primary">
              Go to Dashboard
            </Link>
            <Link to="/lessons" className="btn btn-secondary">
              Browse Premium Lessons
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
