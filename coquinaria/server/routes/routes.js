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
router.post('/recipes', user.recettes);

// Display only the meals
router.get('/recipes/meals', user.meals);
router.post('/recipes/meals', user.meals);

// Display only the breads
router.get('/recipes/breads', user.breads);
router.post('/recipes/breads', user.breads);

// Display only the biscuits
router.get('/recipes/biscuits', user.biscuits);
router.post('/recipes/biscuits', user.biscuits);

// Display only the entrees
router.get('/recipes/entrees', user.entrees);
router.post('/recipes/entrees', user.entrees);

// Display only the sauces
router.get('/recipes/sauces', user.sauces);
router.post('/recipes/sauces', user.sauces);

// Display only the cakes
router.get('/recipes/cakes', user.cakes);
router.post('/recipes/cakes', user.cakes);

// Get a recipe
router.get('/getRecipe/:id', function(req, res) {
	var NUMREC = req.params.id;
	var instructions;
	var ingredients = [];
	var onComplete = function(data) {
		if(!data.result) {
			res.sendStatus(500);
			return res.send(data.error);
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
				instructions = data[0]["TXTREC"];
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