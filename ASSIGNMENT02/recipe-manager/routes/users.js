const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const { ensureAuthenticated } = require('../middleware/auth');

// User profile
router.get('/profile', ensureAuthenticated, async (req, res) => {
    try {
        const userRecipes = await Recipe.find({ createdBy: req.user.id })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();
        
        res.render('users/profile', {
            title: 'My Profile',
            user: req.user,
            recipes: userRecipes
        });
    } catch (error) {
        console.error('Profile error:', error);
        req.flash('error_msg', 'Failed to load profile');
        res.redirect('/');
    }
});

// Update profile
router.put('/profile', ensureAuthenticated, async (req, res) => {
    try {
        const { displayName, bio } = req.body;
        
        await User.findByIdAndUpdate(req.user.id, {
            displayName: displayName || req.user.username,
            bio: bio || '',
            updatedAt: Date.now()
        });
        
        req.flash('success_msg', 'Profile updated successfully!');
        res.redirect('/users/profile');
    } catch (error) {
        console.error('Update profile error:', error);
        req.flash('error_msg', 'Failed to update profile');
        res.redirect('/users/profile');
    }
});

module.exports = router;