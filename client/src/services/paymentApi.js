// client/src/services/paymentApi.js
import api from './api';

export const paymentApi = {
    /**
     * Validate discount/coupon code
     */
    validateDiscount: ({ code, tier, amount }) => {
        return api.post('/discounts/validate', { code, tier, amount });
    },

    /**
     * Redeem a 100% discount without Stripe payment
     */
    redeemFreeDiscount: ({ code, tier }) => {
        return api.post('/discounts/redeem-free', { code, tier });
    },

    /**
     * Create a payment intent (Real Stripe)
     */
    createIntent: (jobId, tier, customerData) => {
        return api.post('/payments/create-intent', { jobId, tier, customerData });
    },

    /**
     * Get payment details
     */
    getPayment: (paymentId) => {
        return api.get(`/payments/${paymentId}`);
    },

    /**
     * Get user payments history
     */
    getUserPayments: (params) => {
        return api.get('/payments', { params });
    },

    /**
     * Mock Upgrade (Dev only)
     * @param {string} tier - 'starter', 'Standard', 'business'
     */
    mockUpgrade: (tier) => {
        return api.post('/payments/mock-upgrade', { tier });
    },

    /**
     * Verify payment intent manually (sync with Stripe)
     */
    verifyPayment: (paymentIntentId) => {
        return api.post('/payments/verify', { paymentIntentId });
    }
};

export default paymentApi;
