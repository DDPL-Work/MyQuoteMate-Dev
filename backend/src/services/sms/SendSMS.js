// ============================================
// src/services/sms/SendSMS.js
// ============================================

const axios = require('axios');
const smsConfig = require('../../config/sms');
const logger = require('../../utils/logger');

/**
 * ClickSend SMS Service
 * Handles all SMS communications via the ClickSend REST API
 */
class SMSService {
    constructor() {
        this.config = smsConfig;
    }

    /**
     * Private: Create Basic Auth header for ClickSend
     * Pick up fresh from config/env to ensure we have latest values
     */
    _getAuthHeader() {
        const username = (this.config.username || process.env.CLICKSEND_USERNAME || '').trim();
        const apiKey = (this.config.apiKey || process.env.CLICKSEND_API_KEY || '').trim();

        if (!username || !apiKey) {
            logger.error('[SMS Service] Missing credentials for Auth Header');
            return null;
        }

        const credentials = Buffer.from(`${username}:${apiKey}`).toString('base64');
        return `Basic ${credentials}`;
    }

    /**
     * Send a single SMS message
     * @param {string} to - Recipient number (E.164 format recommended, e.g., +61400000000)
     * @param {string} body - Message content
     * @param {string} [from] - Optional Sender ID (overrides default)
     * @returns {Promise<Object>} - API Response
     */
    async sendSingleSMS(to, body, from = null) {
        if (!this.config.enabled) {
            logger.warn('[SMS Service] Attempted to send SMS but service is disabled or credentials missing');
            return { success: false, error: 'SMS service disabled' };
        }

        try {
            const authHeader = this._getAuthHeader();
            if (!authHeader) {
                return { success: false, error: 'Authentication credentials missing' };
            }

            logger.info(`[SMS Service] Attempting production SMS to ${to}...`);

            // For international delivery (like India), alphanumeric Sender IDs are often blocked.
            // We'll omit the 'from' field to use ClickSend's most reliable Shared Pool delivery.
            const fromField = to.startsWith('+61') ? this.config.senderId : undefined;

            const payload = {
                messages: [
                    {
                        source: 'MyQuoteMate-Backend',
                        from: fromField,
                        body: body,
                        to: to,
                        schedule: 0
                    }
                ]
            };

            const response = await axios.post(this.config.apiUrl, payload, {
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json'
                }
            });

            const data = response.data;
            if (data.http_code === 200 && data.response_code === 'SUCCESS') {
                const msg = data.data.messages[0];
                logger.info(`[SMS Service] SMS sent successfully. MsgID: ${msg.message_id}, Status: ${msg.status || 'Accepted'}`);
                return { success: true, data: data.data };
            } else {
                logger.error('[SMS Service] ClickSend API error response:', JSON.stringify(data));

                // Check for balance or other obvious errors
                if (data.response_msg?.toLowerCase().includes('balance')) {
                    return { success: false, error: 'Insufficient ClickSend balance' };
                }

                return { success: false, error: data.response_msg || 'API processing failure' };
            }

        } catch (error) {
            const status = error.response ? error.response.status : 'No Response';
            const errorData = error.response ? JSON.stringify(error.response.data) : error.message;
            logger.error(`[SMS Service] CRITICAL FAILURE sending to ${to}. Status: ${status}, Detail: ${errorData}`);

            if (status === 401) {
                return { success: false, error: 'Invalid API credentials (401 Unauthorized)' };
            }
            return { success: false, error: `SMS Gateway Error: ${status}` };
        }
    }

    /**
     * Send bulk SMS messages
     * @param {Array<Object>} messages - Array of { to, body } objects
     * @returns {Promise<Object>} - API Response
     */
    async sendBulkSMS(messages) {
        if (!this.config.enabled) {
            logger.warn('[SMS Service] Attempted to send bulk SMS but service is disabled');
            return { success: false, error: 'SMS service disabled' };
        }

        try {
            logger.info(`[SMS Service] Sending bulk SMS to ${messages.length} recipients...`);

            const payload = {
                messages: messages.map(msg => ({
                    source: 'MyQuoteMate-Backend',
                    from: this.config.senderId,
                    body: msg.body,
                    to: msg.to
                }))
            };

            const response = await axios.post(this.config.apiUrl, payload, {
                headers: {
                    'Authorization': this.authHeader,
                    'Content-Type': 'application/json'
                }
            });

            const data = response.data;
            if (data.http_code === 200) {
                logger.info(`[SMS Service] Bulk SMS processed. Success count: ${data.data.messages.filter(m => m.status === 'SUCCESS').length}`);
                return { success: true, data: data.data };
            }

            return { success: false, error: 'Bulk processing failure' };

        } catch (error) {
            logger.error('[SMS Service] Bulk SMS failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send a verification code
     * @param {string} to - Recipient number
     * @param {string} code - The code to send
     */
    async sendVerificationCode(to, code) {
        const body = `Your MyQuoteMate verification code is: ${code}. Valid for 10 minutes.`;
        return this.sendSingleSMS(to, body);
    }

    /**
     * Send analysis completion notification
     * @param {string} to - Recipient number
     * @param {string} quoteName - Name of the quote analyzed
     */
    async sendAnalysisNotification(to, quoteName) {
        const body = `Great news! Your analysis for "${quoteName}" is complete and ready to view. Login to MyQuoteMate to see your detailed report.`;
        return this.sendSingleSMS(to, body);
    }
}

module.exports = new SMSService();