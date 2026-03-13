// backend/src/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const Lead = require('../models/Lead');
const logger = require('../utils/logger');

// Only configure Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    // Configure Google OAuth Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/v1/auth/google/callback',
        passReqToCallback: true
    },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                // Extract user information from Google profile
                const email = profile.emails?.[0]?.value;
                const googleId = profile.id;
                const firstName = profile.name?.givenName || '';
                const lastName = profile.name?.familyName || '';
                const avatarUrl = profile.photos?.[0]?.value;

                if (!email) {
                    return done(new Error('No email found in Google profile'), null);
                }

                // Check if user already exists
                let user = await User.findOne({
                    $or: [
                        { email: email.toLowerCase() },
                        { googleId: googleId }
                    ],
                    accountStatus: { $ne: 'deleted' }
                });

                if (user) {
                    // User exists - update Google ID if not set
                    if (!user.googleId) {
                        user.googleId = googleId;
                        user.authProvider = 'google';
                        user.emailVerified = true; // Google emails are verified
                        user.phoneVerified = true; // Google account is trusted
                        await user.save();
                        logger.info(`Linked Google account to existing user: ${email}`);
                    }

                    // Update last login
                    await user.updateLastLogin();
                    return done(null, user);
                }

                // Check if there's a guest lead with this email
                const lead = await Lead.findOne({
                    email: email.toLowerCase(),
                    isGuest: true,
                    convertedToUserId: null
                });

                // Create new user
                user = await User.create({
                    email: email.toLowerCase(),
                    googleId,
                    authProvider: 'google',
                    firstName,
                    lastName,
                    avatarUrl,
                    emailVerified: true, // Google emails are pre-verified
                    phoneVerified: true, // Google account is trusted
                    accountStatus: 'active',
                    subscription: {
                        plan: 'Free',
                        status: 'active',
                        credits: 0,
                        reportsUsed: 0,
                        reportsTotal: 1
                    },
                    metadata: {
                        registrationSource: 'google_oauth',
                        ipAddress: req.ip,
                        userAgent: req.get('user-agent')
                    }
                });

                logger.info(`New user created via Google OAuth: ${email}`);

                // If guest lead exists, link it to the new user
                if (lead) {
                    lead.convertedToUserId = user._id;
                    lead.status = 'converted';
                    lead.convertedAt = new Date();
                    await lead.save();

                    // Update all linked jobs to associate with the new user
                    if (lead.linkedJobs && lead.linkedJobs.length > 0) {
                        const Job = require('../models/Job');
                        await Job.updateMany(
                            { _id: { $in: lead.linkedJobs } },
                            { $set: { userId: user._id } }
                        );
                        logger.info(`Linked ${lead.linkedJobs.length} guest jobs to user ${email}`);
                    }
                }

                return done(null, user);
            } catch (error) {
                logger.error('Google OAuth error:', error);
                return done(error, null);
            }
        }));

    logger.info('✅ Google OAuth configured successfully');
} else {
    logger.warn('⚠️  Google OAuth not configured - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET not set. OAuth routes will not work.');
}

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
