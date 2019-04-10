var express = require('express');
var user = require('./user');

var router = express.Router();

// Index of the application. Redirect to login page if not connected, redirect to the list of recipes otherwise.
router.get('/', user.index);

// Signup part of the application
router.get('/inscription', user.signup);
router.post('/inscription', user.signup);

// Login part of the application
router.get('/connexion', user.login);
router.post('/connexion', user.login);

// Creation of a new recipe
router.get('/creerRecette', user.create);
router.post('/creerRecette', user.create);

// Display of all recipes
router.get('/recettes', user.recipes);

// Display a categorie
router.get('/recettes/:cat', user.recipesCat);

// Get a recipe
router.get('/getRecipe', user.recipe);

// Remove recipe
router.post('/removeRecipe', user.removeRecipe);

// Modify recipe
router.get('/modifierRecette', user.modifyRecipe);
router.post('/modifierRecette', user.modifyRecipe);

// Send recipe through mail
router.post('/sendRecipe', user.sendRecipe);

// Verifiy the user
router.get('/verif', user.verifyUser);

// Display the menu
router.get('/menu', user.menu);

// Logout of the app
router.get('/deconnexion', user.logout);

// Display the navbar
router.get('/navbar.html', function(req, res) {res.render('navbar');});

module.exports = router;