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
router.get('/recipes', user.recettes);

// Display a categorie
router.get('/recipes/:cat', user.recipes);

// Get a recipe
router.get('/getRecipe/:id', function(req, res) {
	var NUMREC = req.params.id;
	var instructions;
	var ingredients = [];
	var onComplete = function(data) {
		if(!data.result) {
			res.send(data.error);
		} else {
			res.send(data.data);
		}
	};
	Promise.resolve()
	.then(() => { return new Promise((resolve, reject) => {
		var sql = "SELECT REC.TXTREC FROM REC WHERE REC.NUMREC=" + NUMREC;
		requestLogger.info(sql);
		db.query(sql, function(err, data) {
			if(!err) {
				data[0] && data[0]["TXTREC"] ? instructions = data[0]["TXTREC"] : reject("Aucun résultat");
				resolve();
			} else reject();
		})
	});})
	.then(() => { return new Promise((resolve, reject) => {
		var sql = "SELECT ING.LABING, INGREC.QTEING " + 
					"FROM INGREC, ING, REC " +
					"WHERE REC.NUMREC=" + NUMREC + " " +
					"AND REC.NUMREC = INGREC.NUMREC " +
					"AND ING.NUMING = INGREC.NUMINGREC";
		requestLogger.info(sql);
		db.query(sql, function(err, data) {
			if(!err) {
				for(var i = 0 ; i < data.length ; i++) {
					ingredients.push({name: data[i]["LABING"], amount: data[i]["QTEING"]});
				}
				resolve({instruction: instructions, ingredients: ingredients});
			} else reject();
		})
	});})
	.then (succes => {
	   onComplete({ result: true, data: succes });
	},
	err => {
	   onComplete({ result: false, error: err.message || err.error || err});
	});
});

// Remove recipe
router.post('/removeRecipe/:id', user.removeRecipe);

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