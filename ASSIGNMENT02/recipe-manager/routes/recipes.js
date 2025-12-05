const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const { ensureAuthenticated, checkRecipeOwnership } = require('../middleware/auth');


// User dashboard
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
    try {
        const recipes = await Recipe.find({ createdBy: req.user.id })
            .sort({ updatedAt: -1 })
            .lean();
        
        const stats = {
            total: recipes.length,
            public: recipes.filter(r => r.isPublic).length,
            private: recipes.filter(r => !r.isPublic).length
        };
        
        res.render('recipes/dashboard', {
            title: 'My Dashboard',
            recipes,
            stats
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        req.flash('error_msg', 'Failed to load dashboard');
        res.redirect('/');
    }
});


// Public recipes page with search
router.get('/public', async (req, res) => {
    try {
        const { search, category, difficulty } = req.query;
        let query = { isPublic: true };
        
        // Build search query
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { ingredients: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (category && category !== 'All') {
            query.category = category;
        }
        
        if (difficulty && difficulty !== 'All') {
            query.difficulty = difficulty;
        }
        
        // Get recipes
        const recipes = await Recipe.find(query)
            .sort({ createdAt: -1 })
            .populate('createdBy', 'username displayName avatar')
            .lean();
        
        res.render('recipes/public', {
            title: 'Browse Recipes',
            recipes,
            search: search || '',
            category: category || 'All',
            difficulty: difficulty || 'All',
            categories: ['All', 'Vegetarian', 'Vegan', 'Meat', 'Seafood', 'Dessert', 'Breakfast', 'Lunch', 'Dinner', 'Snack'],
            difficulties: ['All', 'Easy', 'Medium', 'Hard']
        });
    } catch (error) {
        console.error('Public recipes error:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load recipes'
        });
    }
});

// View single recipe
router.get('/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id)
            .populate('createdBy', 'username displayName avatar createdAt')
            .lean();
        
        if (!recipe) {
            req.flash('error_msg', 'Recipe not found');
            return res.redirect('/recipes/public');
        }
        
        // Check if user can edit/delete
        let canEdit = false;
        if (req.user) {
            canEdit = recipe.createdBy._id.toString() === req.user.id || req.user.role === 'admin';
        }
        
        // Increment views
        await Recipe.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
        
        res.render('recipes/view', {
            title: recipe.title,
            recipe,
            canEdit
        });
    } catch (error) {
        console.error('View recipe error:', error);
        req.flash('error_msg', 'Recipe not found');
        res.redirect('/recipes/public');
    }
});


// Add recipe page
router.get('/add/new', ensureAuthenticated, (req, res) => {
    res.render('recipes/add', {
        title: 'Add New Recipe',
        categories: ['Vegetarian', 'Vegan', 'Meat', 'Seafood', 'Dessert', 'Breakfast', 'Lunch', 'Dinner', 'Snack'],
        difficulties: ['Easy', 'Medium', 'Hard']
    });
});

// Create recipe
router.post('/add/new', ensureAuthenticated, async (req, res) => {
    try {
        const { 
            title, 
            description, 
            cookingTime, 
            difficulty, 
            category,
            ingredients,
            instructions
        } = req.body;
        
        // Process arrays
        const ingredientsArray = typeof ingredients === 'string' 
            ? ingredients.split('\n').filter(i => i.trim() !== '')
            : Array.isArray(ingredients) 
                ? ingredients.filter(i => i.trim() !== '')
                : [];
        
        const instructionsArray = typeof instructions === 'string'
            ? instructions.split('\n').filter(i => i.trim() !== '')
            : Array.isArray(instructions)
                ? instructions.filter(i => i.trim() !== '')
                : [];
        
        // Validation
        const errors = [];
        if (!title) errors.push({ msg: 'Title is required' });
        if (!description) errors.push({ msg: 'Description is required' });
        if (ingredientsArray.length === 0) errors.push({ msg: 'At least one ingredient is required' });
        if (instructionsArray.length === 0) errors.push({ msg: 'Instructions are required' });
        if (!cookingTime) errors.push({ msg: 'Cooking time is required' });
        
        if (errors.length > 0) {
            return res.render('recipes/add', {
                title: 'Add New Recipe',
                errors,
                categories: ['Vegetarian', 'Vegan', 'Meat', 'Seafood', 'Dessert', 'Breakfast', 'Lunch', 'Dinner', 'Snack'],
                difficulties: ['Easy', 'Medium', 'Hard'],
                formData: req.body
            });
        }
        
        // Create recipe
        const recipe = new Recipe({
            title,
            description,
            ingredients: ingredientsArray,
            instructions: instructionsArray,
            cookingTime: parseInt(cookingTime),
            difficulty,
            category,
            createdBy: req.user.id
        });
        
        await recipe.save();
        
        req.flash('success_msg', 'Recipe created successfully!');
        res.redirect(`/recipes/${recipe._id}`);
    } catch (error) {
        console.error('Create recipe error:', error);
        req.flash('error_msg', 'Failed to create recipe');
        res.redirect('/recipes/add/new');
    }
});

// Edit recipe page
router.get('/:id/edit', ensureAuthenticated, checkRecipeOwnership, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id).lean();
        
        res.render('recipes/edit', {
            title: 'Edit Recipe',
            recipe,
            categories: ['Vegetarian', 'Vegan', 'Meat', 'Seafood', 'Dessert', 'Breakfast', 'Lunch', 'Dinner', 'Snack'],
            difficulties: ['Easy', 'Medium', 'Hard']
        });
    } catch (error) {
        console.error('Edit page error:', error);
        req.flash('error_msg', 'Failed to load recipe');
        res.redirect(`/recipes/${req.params.id}`);
    }
});

// Update recipe
router.put('/:id', ensureAuthenticated, checkRecipeOwnership, async (req, res) => {
    try {
        const { 
            title, 
            description, 
            cookingTime, 
            difficulty, 
            category,
            ingredients,
            instructions
        } = req.body;
        
        // Process arrays
        const ingredientsArray = typeof ingredients === 'string' 
            ? ingredients.split('\n').filter(i => i.trim() !== '')
            : Array.isArray(ingredients) 
                ? ingredients.filter(i => i.trim() !== '')
                : [];
        
        const instructionsArray = typeof instructions === 'string'
            ? instructions.split('\n').filter(i => i.trim() !== '')
            : Array.isArray(instructions)
                ? instructions.filter(i => i.trim() !== '')
                : [];
        
        // Validation
        const errors = [];
        if (!title) errors.push({ msg: 'Title is required' });
        if (!description) errors.push({ msg: 'Description is required' });
        if (ingredientsArray.length === 0) errors.push({ msg: 'At least one ingredient is required' });
        if (instructionsArray.length === 0) errors.push({ msg: 'Instructions are required' });
        if (!cookingTime) errors.push({ msg: 'Cooking time is required' });
        
        if (errors.length > 0) {
            const recipe = await Recipe.findById(req.params.id).lean();
            return res.render('recipes/edit', {
                title: 'Edit Recipe',
                errors,
                recipe: { ...recipe, ...req.body },
                categories: ['Vegetarian', 'Vegan', 'Meat', 'Seafood', 'Dessert', 'Breakfast', 'Lunch', 'Dinner', 'Snack'],
                difficulties: ['Easy', 'Medium', 'Hard']
            });
        }
        
        // Update recipe
        await Recipe.findByIdAndUpdate(req.params.id, {
            title,
            description,
            ingredients: ingredientsArray,
            instructions: instructionsArray,
            cookingTime: parseInt(cookingTime),
            difficulty,
            category,
            updatedAt: Date.now()
        });
        
        req.flash('success_msg', 'Recipe updated successfully!');
        res.redirect(`/recipes/${req.params.id}`);
    } catch (error) {
        console.error('Update recipe error:', error);
        req.flash('error_msg', 'Failed to update recipe');
        res.redirect(`/recipes/${req.params.id}/edit`);
    }
});

// Delete recipe
router.delete('/:id', ensureAuthenticated, checkRecipeOwnership, async (req, res) => {
    try {
        await Recipe.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Recipe deleted successfully!');
        res.redirect('/recipes/dashboard');
    } catch (error) {
        console.error('Delete recipe error:', error);
        req.flash('error_msg', 'Failed to delete recipe');
        res.redirect(`/recipes/${req.params.id}`);
    }
});

module.exports = router;