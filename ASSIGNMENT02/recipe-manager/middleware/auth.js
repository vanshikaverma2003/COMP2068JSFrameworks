const Recipe = require('../models/Recipe');

module.exports = {
    // Ensure user is authenticated
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Please log in to access this page');
        res.redirect('/auth/login');
    },
    
    // Ensure user is not authenticated (for login/register pages)
    ensureGuest: function(req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        res.redirect('/recipes/dashboard');
    },
    
    // Check if user owns the recipe
    checkRecipeOwnership: async function(req, res, next) {
        try {
            const recipe = await Recipe.findById(req.params.id);
            
            if (!recipe) {
                req.flash('error_msg', 'Recipe not found');
                return res.redirect('/recipes');
            }
            
            // Check if user owns the recipe or is admin
            if (recipe.createdBy.toString() === req.user.id || req.user.role === 'admin') {
                return next();
            }
            
            req.flash('error_msg', 'You do not have permission to perform this action');
            res.redirect(`/recipes/${req.params.id}`);
        } catch (error) {
            console.error(error);
            req.flash('error_msg', 'Server error');
            res.redirect('/recipes');
        }
    },
    
    // Check if user is admin
    isAdmin: function(req, res, next) {
        if (req.user && req.user.role === 'admin') {
            return next();
        }
        req.flash('error_msg', 'Admin access required');
        res.redirect('/');
    }
};