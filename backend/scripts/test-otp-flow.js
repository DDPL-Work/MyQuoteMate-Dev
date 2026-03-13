const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../src/models/User');

const PORT = process.env.PORT || 3000;
const API_URL = `http://localhost:${PORT}/api/v1/auth`;
const TEST_EMAIL = 'test_otp_user@example.com';

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
    } catch (err) {
        console.error('DB Connection Failed', err);
        process.exit(1);
    }
}

async function runTest() {
    await connectDB();

    try {
        // 1. Cleanup
        await User.deleteOne({ email: TEST_EMAIL });
        console.log('Cleaned up test user');

        // 2. Create User
        const user = await User.create({
            email: TEST_EMAIL,
            passwordHash: 'password123',
            firstName: 'Test',
            lastName: 'OTP'
        });
        console.log('Created test user');

        // 3. Generate OTP
        console.log('Requesting OTP...');
        try {
            await axios.post(`${API_URL}/generate-otp`, { email: TEST_EMAIL });
            console.log('OTP Generation Request: SUCCESS');
        } catch (error) {
            console.error('OTP Generation Request: FAILED', error.response?.data || error.message);
            process.exit(1);
        }

        // 4. Retrieve OTP Code from DB
        const userWithOtp = await User.findOne({ email: TEST_EMAIL }).select('+otp.code');
        // Note: The code in DB is HASHED. We can't know the plain text code just by looking at DB hash unless we brute force it or mock the random generator.
        // Ah, right. I implemented hashing.
        // So I cannot verify the "Success" case easily unless I mock the random function OR I know the input.
        // Alternatively, for the sake of this test script, I can manually SET the otp.code in the DB to a specific hash of '123456'.

        // Let's manually set keys for testing
        const crypto = require('crypto');
        const knownCode = '123456';
        const hash = crypto.createHash('sha256').update(knownCode).digest('hex');

        userWithOtp.otp.code = hash;
        userWithOtp.otp.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        userWithOtp.otp.attempts = 0;
        userWithOtp.otp.lockUntil = undefined;
        await userWithOtp.save();
        console.log('Manually set known OTP for testing: 123456');

        // 5. Test Lockout (5 failures)
        console.log('Testing Lockout (sending wrong code 5 times)...');
        for (let i = 1; i <= 5; i++) {
            try {
                await axios.post(`${API_URL}/verify-otp`, { email: TEST_EMAIL, code: '000000' });
                console.log(`Attempt ${i}: Unexpected SUCCESS (Should fail)`);
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    console.log(`Attempt ${i}: Failed as expected (400)`);
                } else if (error.response && error.response.status === 429) {
                    console.log(`Attempt ${i}: Locked out! (429)`);
                } else {
                    console.log(`Attempt ${i}: Failed with ${error.response?.status}`);
                }
            }
        }

        // 6. Verify Lockout applies
        console.log('Verifying Lockout state...');
        try {
            await axios.post(`${API_URL}/verify-otp`, { email: TEST_EMAIL, code: '123456' }); // Correct code but should be locked
            console.log('Lockout Check: Unexpected SUCCESS (Should be locked)');
        } catch (error) {
            if (error.response && error.response.status === 429) {
                console.log('Lockout Check: SUCCESS (Got 429 Locked)');
            } else {
                console.log('Lockout Check: FAILED (Got other error)', error.response?.status, error.response?.data);
            }
        }

        // 7. Reset Lock and Verify Success
        console.log('Resetting Lock manually...');
        const lockedUser = await User.findOne({ email: TEST_EMAIL }).select('+otp.code');
        lockedUser.otp.lockUntil = undefined;
        lockedUser.otp.attempts = 0;
        await lockedUser.save();

        console.log('Testing Successful Verification...');
        try {
            const res = await axios.post(`${API_URL}/verify-otp`, { email: TEST_EMAIL, code: '123456' });
            console.log('Verification: SUCCESS', res.data);
        } catch (error) {
            console.error('Verification: FAILED', error.response?.data || error.message);
        }

    } catch (err) {
        console.error('Test Failed', err);
    } finally {
        await mongoose.connection.close();
    }
}

runTest();
