// client/src/utils/pricingFlowUtils.js

const TIER_STORAGE_KEY = 'selectedPricingTier';

export const pricingFlowUtils = {
    /**
     * Store selected pricing tier for later use
     * @param {string} tier - Tier name (Standard/Premium)
     * @param {string|number} price - Tier price
     */
    storeTierSelection(tier, price) {
        try {
            sessionStorage.setItem(TIER_STORAGE_KEY, JSON.stringify({ tier, price }));
        } catch (e) {
            console.error('Failed to store tier selection:', e);
        }
    },

    /**
     * Retrieve stored tier selection
     * @returns {{tier: string, price: string}|null}
     */
    getTierSelection() {
        try {
            const stored = sessionStorage.getItem(TIER_STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.error('Failed to retrieve tier selection:', e);
            return null;
        }
    },

    /**
     * Clear tier selection
     */
    clearTierSelection() {
        try {
            sessionStorage.removeItem(TIER_STORAGE_KEY);
        } catch (e) {
            console.error('Failed to clear tier selection:', e);
        }
    }
};
