import { stripeAPI } from "../api/endpoints";

/**
 * Handles the Stripe checkout process
 * @param {string} userId - The ID of the user upgrading
 * @returns {Promise<void>}
 */
export const handleStripeCheckout = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required for checkout");
  }

  try {
    const response = await stripeAPI.createCheckoutSession({ userId });

    const redirectUrl =
      response?.data?.url ||
      response?.url ||
      response?.data?.sessionUrl ||
      response?.data?.checkoutUrl;

    if (!redirectUrl) {
      throw new Error("No redirect URL received from payment server");
    }

    // Redirect to Stripe Checkout
    window.location.href = redirectUrl;
  } catch (error) {
    console.error("Stripe checkout error:", error);
    throw error;
  }
};
