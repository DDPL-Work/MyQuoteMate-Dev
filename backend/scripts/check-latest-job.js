const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Try to find .env in common locations
const paths = [
    path.join(__dirname, '../../.env'), // Root
    path.join(__dirname, '../.env'),    // Backend root
    path.join(process.cwd(), '.env'),   // CWD
    path.join(process.cwd(), 'backend/.env')
];

let loaded = false;
for (const p of paths) {
    if (fs.existsSync(p)) {
        console.log(`Loading .env from: ${p}`);
        dotenv.config({ path: p });
        loaded = true;
        break;
    }
}

if (!loaded) {
    console.log('⚠️ Could not find .env file! MongoDB URI might be missing.');
}
const mongoose = require('mongoose');

// Define minimal schemas to avoid import issues
const jobSchema = new mongoose.Schema({}, { strict: false });
const resultSchema = new mongoose.Schema({}, { strict: false });
const userSchema = new mongoose.Schema({
    email: String,
    firstName: String,
    lastName: String,
    role: String,
    subscription: {
        plan: String,
        credits: Number
    }
}, { strict: false });

const Job = mongoose.model('Job', jobSchema);
const Result = mongoose.model('Result', resultSchema);
const User = mongoose.model('User', userSchema);

async function checkLatestJob() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected');

        // Find latest job
        const latestJob = await Job.findOne().sort({ createdAt: -1 });

        if (!latestJob) {
            console.log('❌ No jobs found in database.');
            return;
        }

        console.log(`\n📄 Latest Job Found:`);
        console.log(`   ID: ${latestJob._id}`);
        console.log(`   Created: ${latestJob.createdAt}`);
        console.log(`   Status: ${latestJob.status}`);
        console.log(`   File: ${latestJob.data?.originalName || 'Unknown'}`);
        console.log(`   UserID: ${latestJob.userId}`);

        if (latestJob.userId) {
            try {
                const user = await User.findById(latestJob.userId);
                if (user) {
                    console.log(`\n👤 User Linked to Job:`);
                    console.log(`   ID: ${user._id}`);
                    console.log(`   Email: ${user.email}`);
                    console.log(`   Plan: ${user.subscription?.plan}`);
                    console.log(`   Credits: ${user.subscription?.credits}`);
                } else {
                    console.log(`\n⚠️ User ${latestJob.userId} not found in DB!`);
                }
            } catch (err) {
                console.log(`\n⚠️ Error fetching user: ${err.message}`);
            }
        } else {
            console.log(`\n⚠️ This job has NO UserID (Guest Upload?)`);
        }

        if (latestJob.status !== 'completed') {
            console.log('⚠️ Job is not completed yet.');
        }

        // Find result
        let result = await Result.findOne({ jobId: latestJob._id });

        // Fallback search if not linked
        if (!result && latestJob.result) {
            result = await Result.findById(latestJob.result);
        }

        if (!result) {
            console.log('❌ No result found for this job.');
        } else {
            console.log(`\n📊 Analysis Result:`);
            console.log(`   Result ID: ${result._id}`);
            console.log(`   Tier: ${result.tier}`);

            const recs = result.recommendations || [];
            const bench = result.benchmarking || [];

            console.log(`\n✨ Premium Features Status:`);
            console.log(`   - Recommendations: ${recs.length} items`);
            console.log(`   - Benchmarking:    ${bench.length} items`);

            if (recs.length >= 4 && bench.length >= 5) {
                console.log('\n✅ SUCCESS: Premium features are fully populated!');
            } else if (result.tier === 'premium') {
                console.log('\n❌ FAILURE: Premium features missing or incomplete.');
                console.log('   (Is this an old quote from before the fix?)');
            } else {
                console.log(`\nℹ️ Note: This is a ${result.tier} tier quote.`);
                console.log('   Premium features are NOT expected unless tier is Premium.');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected');
    }
}

checkLatestJob();
