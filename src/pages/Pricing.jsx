import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { stripeAPI } from "../api/endpoints";
import { useAuth } from "../hooks/useAuth";
import "./Pages.css";

const FEATURE_ROWS = [
  {
    label: "Access to lessons",
    free: "Public lessons",
    premium: "All lessons + premium exclusives",
  },
  {
    label: "Create premium lessons",
    free: "Limited drafts",
    premium: "Publish premium & free lessons",
  },
  {
    label: "Favorites and saves",
    free: "Save up to 20",
    premium: "Unlimited saves",
  },
  {
    label: "Ad-free experience",
    free: "Standard",
    premium: "100% ad-free",
  },
  {
    label: "Priority listing",
    free: "Normal",
    premium: "Priority placement in discover",
  },
  {
    label: "Support",
    free: "Community support",
    premium: "Priority support",
  },
  {
    label: "Weekly curator picks",
    free: "Email summary",
    premium: "Personalized picks + reminders",
  },
  {
    label: "Pricing",
    free: "Free forever",
    premium: "৳1500 one-time (lifetime)",
  },
];

const Pricing = () => {
  const { user, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isPremium = !!user?.isPremium;

  // Refresh user data on mount and when search params change
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Refresh again when returning from payment
  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "success") {
      setSuccessMessage("Payment completed. Your premium plan is active.");
      // Force refresh after successful payment
      setTimeout(() => {
        refreshUser();
      }, 1000);
    }
  }, [searchParams, refreshUser]);

  const priceDisplay = useMemo(
    () => ({ amount: "৳1500", label: "Lifetime access" }),
    []
  );

  const handleCheckout = async () => {
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      if (!user?._id) {
        throw new Error("Please log in to upgrade to premium.");
      }

      console.log("Creating checkout session for user:", user._id);

      const response = await stripeAPI.createCheckoutSession({
        userId: user._id,
      });

      console.log("Checkout session response:", response);

      // Handle various response formats
      const redirectUrl =
        response?.data?.url ||
        response?.url ||
        response?.data?.sessionUrl ||
        response?.data?.checkoutUrl;

      if (!redirectUrl) {
        console.error("No redirect URL found in response:", response);
        throw new Error("Failed to create payment session. Please try again.");
      }

      console.log("Redirecting to Stripe checkout:", redirectUrl);

      // Redirect to Stripe checkout
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 500);
    } catch (err) {
      console.error("Checkout error:", err);
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Unable to create payment session. Please try again.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="page pricing-page">
      <section className="pricing-hero">
        <div>
          <p className="eyebrow">Upgrade</p>
          <h1>Go Premium and unlock every life lesson</h1>
          <p className="section-subtitle">
            One-time payment, lifetime access. No recurring fees.
          </p>
          <div className="plan-meta">
            <span className="price-chip">{priceDisplay.amount}</span>
            <span className="plan-label">{priceDisplay.label}</span>
            {isPremium && (
              <span className="status-badge">Premium ⭐ Active</span>
            )}
          </div>
          {successMessage && (
            <div className="inline-alert success-alert">{successMessage}</div>
          )}
          {error && <div className="inline-alert">{error}</div>}
        </div>
        <div className="plan-card">
          <p className="eyebrow">Premium Plan</p>
          <h2>Lifetime Premium</h2>
          <p className="plan-price">{priceDisplay.amount}</p>
          <p className="plan-caption">
            One-time payment. Keep premium forever.
          </p>
          <button
            className="btn btn-primary btn-block"
            onClick={handleCheckout}
            disabled={loading || isPremium}
          >
            {isPremium ? "You are already Premium" : "Upgrade to Premium"}
          </button>
          <p className="small-note">
            Powered by Stripe Checkout (test mode). You will be redirected to
            Stripe.
          </p>
        </div>
      </section>

      <section className="section comparison-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Plan comparison</p>
            <h2>Free vs Premium</h2>
            <p className="section-subtitle">Choose what fits you best.</p>
          </div>
        </div>

        <div className="comparison-table">
          <div className="comparison-row comparison-head">
            <div>Features</div>
            <div>Free</div>
            <div>Premium</div>
          </div>
          {FEATURE_ROWS.map((row) => (
            <div key={row.label} className="comparison-row">
              <div className="label">{row.label}</div>
              <div>{row.free}</div>
              <div>{row.premium}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section guarantee-section">
        <div className="guarantee-card">
          <h3>Single source of truth</h3>
          <p>
            Your premium status is always verified against our database on each
            session. If you upgrade, your account instantly reflects it after
            Stripe confirms payment.
          </p>
          <p className="section-subtitle">
            If payment fails or is canceled, you will be redirected to the
            cancel page with a clear message.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
