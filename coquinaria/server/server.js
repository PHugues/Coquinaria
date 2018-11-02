var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var log4js = require('log4js');
var cors = require('cors');

log4js.configure('./coquinaria/server/config/log4js.json');
var app = express();
var logger = log4js.getLogger();

app.use(bodyParser.urlencoded({extended: true}));
app.use(require('./routes/routes'));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use(function(req, res) {
	res.status(404).render('404');
});

var server = app.listen(8080, function() {
	logger.info("HTTP server listening on port 8080");
});