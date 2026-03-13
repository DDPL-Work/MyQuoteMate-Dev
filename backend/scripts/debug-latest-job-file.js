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

let loaded = false;
for (const p of paths) {
    if (fs.existsSync(p)) {
        dotenv.config({ path: p });
        loaded = true;
        break;
    }
}

const mongoose = require('mongoose');

// Schemas
const jobSchema = new mongoose.Schema({}, { strict: false });
const resultSchema = new mongoose.Schema({}, { strict: false });
const userSchema = new mongoose.Schema({}, { strict: false });

const Job = mongoose.model('Job', jobSchema);
const Result = mongoose.model('Result', resultSchema);
const User = mongoose.model('User', userSchema);

const OUTPUT_FILE = path.join(__dirname, 'debug_output.txt');

async function log(msg) {
    fs.appendFileSync(OUTPUT_FILE, msg + '\n');
}

async function check() {
    fs.writeFileSync(OUTPUT_FILE, '--- DEBUG LOG ---\n');
    try {
        await log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        await log('Connected.');

        const latestJob = await Job.findOne().sort({ createdAt: -1 });
        if (!latestJob) {
            await log('No jobs found.');
            return;
        }

        await log(`Latest Job ID: ${latestJob._id}`);
        await log(`Created At: ${latestJob.createdAt}`);
        await log(`Status: ${latestJob.status}`);
        await log(`User ID: ${latestJob.userId}`);

        if (latestJob.userId) {
            const user = await User.findById(latestJob.userId);
            if (user) {
                await log(`User Email: ${user.email}`);
                await log(`User Plan: ${user.subscription?.plan}`);
                await log(`User Credits: ${user.subscription?.credits}`);
            } else {
                await log('User not found in DB.');
            }
        }

        let result = await Result.findOne({ jobId: latestJob._id });
        if (!result && latestJob.result) result = await Result.findById(latestJob.result);

        if (result) {
            await log(`Result ID: ${result._id}`);
            await log(`Result Tier: ${result.tier}`);
            const recs = result.recommendations || [];
            await log(`Recommendations Count: ${recs.length}`);

            if (result.metadata && result.metadata.debugLog) {
                await log('--- INTERNAL DEBUG LOG ---');
                result.metadata.debugLog.forEach(async (line) => await log(line));
            } else {
                await log('No internal debug log found in metadata.');
            }

            if (result.aiResponse && result.aiResponse.rawOutput) {
                await log('--- RAW AI OUTPUT (partial) ---');
                const raw = result.aiResponse.rawOutput;
                const analysis = raw.analysis || {};
                await log(`Has Analysis Object: ${!!raw.analysis}`);
                await log(`Raw Recs Length: ${analysis.recommendations?.length}`);
                await log(`Raw Bench Length: ${analysis.benchmarking?.length}`);

                if (analysis.recommendations && analysis.recommendations.length > 0) {
                    await log('First Rec Title: ' + analysis.recommendations[0].title);
                    await log('First Rec Desc Length: ' + (analysis.recommendations[0].description?.length || 0));
                }
            }
        } else {
            await log('No result found.');
        }

    } catch (err) {
        await log(`Error: ${err.message}`);
    } finally {
        await mongoose.disconnect();
        await log('Done.');
    }
}

check();
