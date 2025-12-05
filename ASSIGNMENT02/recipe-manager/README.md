# Recipe Manager

A full-featured recipe management application built with Node.js, Express, MongoDB, and Handlebars.

## Features
- **User Authentication**: Register, login, and logout functionality
- **GitHub OAuth**: Login with GitHub account
- **CRUD Operations**: Create, read, update, and delete recipes
- **Public Recipe Browsing**: View all recipes without authentication
- **Search Functionality**: Search recipes by title, ingredients, or category
- **User Dashboard**: Personal space to manage your recipes
- **Responsive Design**: Mobile-friendly Bootstrap 5 interface

## Additional Feature: Advanced Search
Implemented a comprehensive search system that allows users to:
- Search recipes by keywords in title, description, or ingredients
- Filter by category (Vegetarian, Vegan, Meat, etc.)
- Filter by difficulty level (Easy, Medium, Hard)
- View search results in a clean, paginated format

## Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Template Engine**: Handlebars (HBS)
- **Authentication**: Passport.js (Local + GitHub OAuth)
- **Styling**: Bootstrap 5 + Custom CSS
- **Session Management**: Express Session with MongoDB Store

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd recipe-manager