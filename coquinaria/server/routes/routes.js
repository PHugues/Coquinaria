var express = require('express');
var user = require('./user');

var router = express.Router();

// Index of the application. Redirect to login page if not connected, redirect to create otherwise.
router.get('/', user.index);

// Signup part of the application
router.get('/signup', user.signup);
router.post('/signup', user.signup);

// Login part of the application
router.get('/login', user.login);
router.post('/login', user.login);

// Creation of a new recipe
router.get('/create', user.create);
router.post('/create', user.create);

// Display of all recipes
router.get('/recettes', user.recettes);
router.post('/recettes', user.recettes);

// Display the menu
router.get('/menu', user.menu);
router.post('/menu', user.menu);

// Logout of the app
router.get('/logout', user.logout);
router.post('/logout', user.logout);

// Display the navbar
router.get('/navbar.html', function(req, res) {
	res.render('navbar');
});

module.exports = router;