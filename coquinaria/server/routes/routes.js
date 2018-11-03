var express = require('express');
var log4js = require('log4js');
global.jwt = require('jsonwebtoken');
global.cookie = require('cookie')
var user = require('./user');
var DB = require('../config/config');
global.bcrypt = require('bcrypt');

global.token;
var router = express.Router();

log4js.configure('./coquinaria/server/config/log4js.json');
global.logger = log4js.getLogger();
global.requestLogger = log4js.getLogger("request");

router.get('/', function(req, res) {
    var cookies = cookie.parse(req.headers.cookie || '');
    var token = cookies.token
    if (token && token != "null") {
        jwt.verify(token, process.env.SECRET_KEY, function(err) {
            if (!err) res.redirect('/create')
        });
    } else {
        res.render('index', {message: ''});
    }
});

router.get('/signup', user.signup);
router.get('/login', user.login);
router.post('/login', user.login);
router.post('/signup', user.signup);

router.get('/create', function(req, res) {
    var cookies = cookie.parse(req.headers.cookie || '');
    var token = cookies.token
    if (token && token != "null") {
        jwt.verify(token, process.env.SECRET_KEY, function(err) {
            if (!err) res.render('create')
        });
    } else {
        res.redirect('/');
    }
});

router.get('/recettes', function(req, res) {
    var cookies = cookie.parse(req.headers.cookie || '');
    var token = cookies.token
    if (token && token != "null") {
        jwt.verify(token, process.env.SECRET_KEY, function(err) {
            if (!err) res.render('recette')
        });
    } else {
        res.redirect('/');
    }
});

router.get('/menu', function(req, res) {
    var cookies = cookie.parse(req.headers.cookie || '');
    var token = cookies.token
    if (token && token != "null") {
        jwt.verify(token, process.env.SECRET_KEY, function(err) {
            if (!err) res.render('menu')
        });
    } else {
        res.redirect('/');
    }
});

router.get('/logout', function(req, res) {
    var cookies = cookie.parse(req.headers.cookie || '');
    var token = cookies.token
    if (token && token != "null") {
        jwt.verify(token, process.env.SECRET_KEY, function(err) {
            if (!err) res.setHeader('Set-Cookie', cookie.serialize('token', token, {
                expires: new Date()
            }));
        });
    }
    res.redirect('/');
})

router.get('/navbar.html', function(req, res) {
	res.render('navbar');
});

router.post('/createRec', function(req, res) {
    logger.info("Request send from [" + req.ip + "]");
    requestLogger.info("From [" + req.ip + "] Request :\n" + JSON.stringify(req.body));
    res.redirect('/');
});

module.exports = router;