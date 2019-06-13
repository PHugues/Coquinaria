var mysql = require('mysql');
var log4js = require('log4js');
var nodemailer = require('nodemailer');

//Configure the loggers
log4js.configure('./server/config/log4js.json');
global.logger = log4js.getLogger();
global.httpLogger = log4js.getLogger("http");
global.requestLogger = log4js.getLogger("request");

//Create connection to the database
let connectionDb = mysql.createConnection({
    host: 'hostname-or-ip',
    user: 'username',
    password: 'password',
    database: 'name-of-database'
});

//Create connection to the email
let transporter = nodemailer.createTransport({
    host: 'hostname',
    port: 465,
    secure: true,
    auth: {
        user: 'mail-adress',
        pass: 'password'
    },
    tls: {
        rejectUnauthorized: true
    }
})

//Connect the database
connectionDb.connect();
global.db = connectionDb;
logger.info("Database connected.");

//Secret Key to generate the tokens
process.env.SECRET_KEY = "secret-key";

//Verify mail connection configuration
transporter.verify(function(error, success) {
    if(error) logger.error(error);
    else {
        logger.info("Mail server connected.");
        global.transporter = transporter;
    }
});