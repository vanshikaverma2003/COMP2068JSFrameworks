const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');

// Home page
router.get('/', async (req, res) => {
    try {
        // Get recent recipes
        const recentRecipes = await Recipe.find({ isPublic: true })
            .sort({ createdAt: -1 })
            .limit(6)
            .populate('createdBy', 'username displayName avatar')
            .lean();
        
        // Get popular recipes (by views)
        const popularRecipes = await Recipe.find({ isPublic: true })
            .sort({ views: -1 })
            .limit(6)
            .populate('createdBy', 'username displayName avatar')
            .lean();
        
        res.render('index', {
            title: 'Recipe Manager - Home',
            recentRecipes,
            popularRecipes
        });
    } catch (error) {
        console.error('Home page error:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load home page'
        });
    }
});

// About page
router.get('/about', (req, res) => {
    res.render('about', {
        title: 'About Recipe Manager'
    });
});

// Contact page
router.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Contact Us'
    });
});

module.exports = router;