var http = require('http');
var url = require('url');
var io = require('socket.io');
var express = require('express');
var fs = require('fs');
var path = require('path');

var app = express();
var server = http.createServer(app);
var socket = io.listen(server);

app.use(express.static(path.join(__dirname, 'public')));
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.get('/', function(req, res){
    res.render('index');
});

app.get('/recettes', function(req, res) {
	res.render('recette');
});

app.get('/menu', function(req, res) {
	res.render('menu');
})

app.get('/navbar.html', function(req, res) {
	res.render('navbar');
});

app.post('/createRec', function(req, res) {
	console.log(req.body);
	res.redirect('/');
});

app.listen(8080);
console.log('Server started.');