// ============================================
// src/config/sms.js
// ============================================

/**
 * ClickSend SMS Configuration
 * Requires CLICKSEND_USERNAME and CLICKSEND_API_KEY in .env
 */

const username = process.env.CLICKSEND_USERNAME;
const apiKey = process.env.CLICKSEND_API_KEY;

if (!username || !apiKey) {
    console.warn('[SMS Config] ClickSend credentials missing. SMS service will be disabled.');
}

module.exports = {
    /**
     * ClickSend Credentials
     */
    username: username || '',
    apiKey: apiKey || '',

    /**
     * API Settings
     */
    apiUrl: 'https://rest.clicksend.com/v3/sms/send',

    /**
     * Default Sender ID
     * In Australia, this can be an 11-character alphanumeric string or a dedicated number
     */
    senderId: process.env.CLICKSEND_SENDER_ID || 'MyQuoteMate',

    /**
     * Enabled Flag
     */
    enabled: !!(username && apiKey)
};
