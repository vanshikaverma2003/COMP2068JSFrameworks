var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', { 
    title: 'Vanshika Verma - Portfolio',
    currentPage: 'home'
  });
});

/* GET about me page. */
router.get('/about', function(req, res, next) {
  res.render('about', { 
    title: 'About Me - Vanshika Verma',
    currentPage: 'about'
  });
});

/* GET projects page. */
router.get('/projects', function(req, res, next) {
  res.render('projects', { 
    title: 'Projects - Vanshika Verma',
    currentPage: 'projects'
  });
});

/* GET contact me page. */
router.get('/contact', function(req, res, next) {
  res.render('contact', { 
    title: 'Contact Me - Vanshika Verma',
    currentPage: 'contact'
  });
});

/* Optional: GET for a 404 test page (or remove if not needed) */
router.get('/test-error', function(req, res, next) {
  next(createError(404, 'Test error page not found'));
});


module.exports = router;
