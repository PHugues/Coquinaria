var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var log4js = require('log4js');

log4js.configure('./coquinaria/server/config/log4js.json');
var app = express();
var logger = log4js.getLogger();

app.use(bodyParser.urlencoded({extended: false}));
app.use(require('./routes/routes'));
app.use(express.static(path.join(__dirname, 'public')));
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

var server = app.listen(8080, function() {
	try {
		logger.info("HTTP server listening on port 8080");
	}
	catch(e) {
		logger.error(e);
	}
});