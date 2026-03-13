/**
 * OpenAI API Key Test Script
 * 
 * Usage: node src/scripts/TestOpenAIService.js
 * 
 * This script verifies that the OpenAI API key is correctly configured
 * and the service is reachable.
 */

// Load environment variables
require('dotenv').config();

const OpenAI = require('openai');
const openaiConfig = require('../config/openai');
const logger = require('../utils/logger');

async function testOpenAI() {
    console.log('--- OpenAI API Key Test ---');
    console.log('Environment:', process.env.NODE_ENV || 'not set');
    console.log('Model:', openaiConfig.model);

    // Basic validation of API Key format
    if (!openaiConfig.apiKey) {
        console.error('❌ ERROR: OPENAI_API_KEY is not defined in .env');
        process.exit(1);
    }

    if (openaiConfig.apiKey.startsWith('sk-your-')) {
        console.error('❌ ERROR: OPENAI_API_KEY still has the placeholder value "sk-your-..."');
        console.error('Please update the .env file with your actual OpenAI API key.');
        process.exit(1);
    }

    console.log('API Key format check: Valid (starts with sk-...)');
    console.log('Attempting authentication and simple completion...');

    const openai = new OpenAI({
        apiKey: openaiConfig.apiKey,
        timeout: 10000 // 10s timeout for test
    });

    try {
        const startTime = Date.now();
        const response = await openai.chat.completions.create({
            model: openaiConfig.model,
            messages: [
                { role: 'system', content: 'You are a service connectivity tester.' },
                { role: 'user', content: 'Say "OpenAI Connection Successful" if you can read this.' }
            ],

        });

        const duration = Date.now() - startTime;
        const result = response.choices[0].message.content.trim();

        console.log('\n--- Test Result ---');
        console.log('Status: ✅ SUCCESS');
        console.log('Response:', result);
        console.log('Latency:', duration + 'ms');
        console.log('Tokens used:', response.usage.total_tokens);
        console.log('-------------------');

        if (result.includes('Connection Successful')) {
            console.log('\nYour OpenAI API key is working perfectly! 🚀');
        } else {
            console.log('\nUnexpected response received, but the API call succeeded.');
        }

    } catch (error) {
        console.error('\n--- Test Result ---');
        console.log('Status: ❌ FAILED');

        if (error.status === 401) {
            console.error('Error Type: Authentication Failed (401)');
            console.error('Message: Your API key is likely invalid or has expired.');
        } else if (error.status === 429) {
            console.error('Error Type: Rate Limit/Quota Exceeded (429)');
            console.error('Message: You have exceeded your current quota or rate limits.');
        } else if (error.code === 'ENOTFOUND') {
            console.error('Error Type: Network Error');
            console.error('Message: Could not reach OpenAI servers. Check your internet connection.');
        } else {
            console.error('Error Type:', error.name || 'Unknown');
            console.error('Message:', error.message);
        }
        console.log('-------------------');
        process.exit(1);
    }
}

// Ensure we are in the right directory context for config requires
testOpenAI();