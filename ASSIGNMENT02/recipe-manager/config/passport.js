const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Local Strategy
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            return done(null, false, { message: 'Invalid email or password' });
        }

        // Check if user has password (GitHub users might not)
        if (!user.password) {
            return done(null, false, { message: 'Please login with GitHub or reset your password' });
        }

        const isMatch = await user.comparePassword(password);
        
        if (!isMatch) {
            return done(null, false, { message: 'Invalid email or password' });
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/auth/github/callback',
    scope: ['user:email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Find user by GitHub ID
        let user = await User.findOne({ githubId: profile.id });

        if (user) {
            return done(null, user);
        }

        // Check if user exists with GitHub email
        user = await User.findOne({ 
            email: profile.emails[0].value 
        });

        if (user) {
            // Link GitHub account to existing user
            user.githubId = profile.id;
            if (!user.avatar || user.avatar === '/images/default-avatar.png') {
                user.avatar = profile.photos[0].value;
            }
            await user.save();
            return done(null, user);
        }

        // Create new user
        user = new User({
            githubId: profile.id,
            username: profile.username || profile.emails[0].value.split('@')[0],
            email: profile.emails[0].value,
            displayName: profile.displayName || profile.username,
            avatar: profile.photos[0].value || '/images/default-avatar.png'
        });

        await user.save();
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// Serialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

module.exports = passport;