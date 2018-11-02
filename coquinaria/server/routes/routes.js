var express = require('express');
var router = express.Router();
var log4js = require('log4js');

log4js.configure('./coquinaria/server/config/log4js.json');
var logger = log4js.getLogger();
var requestLogger = log4js.getLogger("request");

router.get('/', function(req, res) {
    res.render('index');
});

router.get('/recettes', function(req, res) {
	res.render('recette');
});

router.get('/menu', function(req, res) {
	res.render('menu');
})

router.get('/navbar.html', function(req, res) {
	res.render('navbar');
});

router.post('/createRec', function(req, res) {
    try {
        logger.info("Request send from [" + req.ip + "]");
        requestLogger.info("From [" + req.ip + "] Request :\n" + JSON.stringify(req.body));
    }
    catch(e) {
        logger.error(e);
    }
    res.redirect('/');
});

module.exports = router;