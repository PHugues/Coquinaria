var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cors = require('cors');
var config = require('./config/config');

var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(require('./routes/routes'));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.set('trust proxy', true);

//Redirect to 404 if page doesn't exist
app.use(function(req, res) {
	res.status(404).render('404');
});

//Launch server
var server = app.listen(8080, function() {
	logger.info("HTTP server listening on port 8080");
});