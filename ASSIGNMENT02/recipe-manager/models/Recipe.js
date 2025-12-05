const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    ingredients: [{
        type: String,
        required: [true, 'At least one ingredient is required'],
        trim: true
    }],
    instructions: [{
        type: String,
        required: [true, 'Instructions are required'],
        trim: true
    }],
    cookingTime: {
        type: Number,
        required: [true, 'Cooking time is required'],
        min: [1, 'Cooking time must be at least 1 minute']
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    category: {
        type: String,
        enum: ['Vegetarian', 'Vegan', 'Meat', 'Seafood', 'Dessert', 'Breakfast', 'Lunch', 'Dinner', 'Snack'],
        default: 'Dinner'
    },
    imageUrl: {
        type: String,
        default: '/images/recipe-default.jpg'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Update timestamps
recipeSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

recipeSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
});

// Create text index for search
recipeSchema.index({ 
    title: 'text', 
    description: 'text', 
    'ingredients': 'text',
    category: 1,
    difficulty: 1
});

// Virtuals
recipeSchema.virtual('formattedCookingTime').get(function() {
    if (this.cookingTime < 60) {
        return `${this.cookingTime} minutes`;
    } else {
        const hours = Math.floor(this.cookingTime / 60);
        const minutes = this.cookingTime % 60;
        if (minutes === 0) {
            return `${hours} hour${hours > 1 ? 's' : ''}`;
        } else {
            return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minutes`;
        }
    }
});

recipeSchema.virtual('ingredientCount').get(function() {
    return this.ingredients.length;
});

recipeSchema.virtual('instructionCount').get(function() {
    return this.instructions.length;
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;