const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Find .env
const paths = [
    path.join(__dirname, '../../.env'),
    path.join(__dirname, '../.env'),
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), 'backend/.env')
];

for (const p of paths) {
    if (fs.existsSync(p)) {
        dotenv.config({ path: p });
        break;
    }
}

const mongoose = require('mongoose');

// Schema
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function restore() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const email = 'professor@gmail.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log(`Found user: ${user._id}`);
            console.log(`Current Plan: ${user.subscription?.plan}`);
            console.log(`Current Credits: ${user.subscription?.credits}`);

            user.subscription = {
                ...user.subscription,
                plan: 'Premium',
                credits: 10,
                status: 'active'
            };

            await user.save();
            console.log('✅ RESTORED: Plan set to Premium, Credits set to 10');
        } else {
            console.log('❌ User not found');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

restore();
