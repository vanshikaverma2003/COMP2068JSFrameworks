const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const { ensureGuest } = require('../middleware/auth');

// Login page
router.get('/login', ensureGuest, (req, res) => {
    res.render('auth/login', {
        title: 'Login to Recipe Manager'
    });
});

// Login handle
router.post('/login', ensureGuest, (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/recipes/dashboard',
        failureRedirect: '/auth/login',
        failureFlash: true
    })(req, res, next);
});

// Register page
router.get('/register', ensureGuest, (req, res) => {
    res.render('auth/register', {
        title: 'Create Account'
    });
});

// Register handle
router.post('/register', ensureGuest, async (req, res) => {
    try {
        const { username, email, password, password2, displayName } = req.body;
        
        // Validation
        const errors = [];
        
        if (!username || !email || !password || !password2) {
            errors.push({ msg: 'Please fill in all fields' });
        }
        
        if (password.length < 6) {
            errors.push({ msg: 'Password must be at least 6 characters' });
        }
        
        if (password !== password2) {
            errors.push({ msg: 'Passwords do not match' });
        }
        
        if (errors.length > 0) {
            return res.render('auth/register', {
                title: 'Create Account',
                errors,
                username,
                email,
                displayName
            });
        }
        
        // Check if user exists
        const existingUser = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { username }]
        });
        
        if (existingUser) {
            errors.push({ msg: 'Email or username already exists' });
            return res.render('auth/register', {
                title: 'Create Account',
                errors,
                username,
                email,
                displayName
            });
        }
        
        // Create new user
        const user = new User({
            username,
            email: email.toLowerCase(),
            password,
            displayName: displayName || username
        });
        
        await user.save();
        
        req.flash('success_msg', 'Registration successful! Please log in.');
        res.redirect('/auth/login');
        
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error_msg', 'Registration failed. Please try again.');
        res.redirect('/auth/register');
    }
});

// GitHub authentication
router.get('/github', passport.authenticate('github', { 
    scope: ['user:email']
}));

// GitHub callback
router.get('/github/callback',
    passport.authenticate('github', { 
        failureRedirect: '/auth/login',
        failureFlash: true 
    }),
    (req, res) => {
        req.flash('success_msg', 'Successfully logged in with GitHub!');
        res.redirect('/recipes/dashboard');
    }
);

// Logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            req.flash('error_msg', 'Error logging out');
            return res.redirect('/');
        }
        req.flash('success_msg', 'You have been logged out');
        res.redirect('/');
    });
});

module.exports = router;