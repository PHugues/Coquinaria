var jwt = require('jsonwebtoken');
var cookie = require('cookie');
var bcrypt = require('bcrypt');

//Index
exports.index = function(req, res) {
    var cookies = cookie.parse(req.headers.cookie || '');
    var token = cookies.token;
    var personn = cookies.personn;
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, function(err) {
            if (!err) res.redirect('/create')
        });
    } else {
        res.render('index', {message: ''});
    }
}

//Signup 
exports.signup = async function(req, res) {
    var message = "";
    if(req.method == "POST") {
        var data = req.body;
        if(data.pass != data.pass2) {
            message = "Les mots de passes doivent correspondre."
            res.render('signup', {message: message});
        } else {
            exist(data.mail).then(function (success) {
                    message = "Cette adresse existe déjà, veuillez réessayer.";
                    logger.error("Register attempt from [" + req.ip + "] failed.");
                    res.render('signup', {message: message});
            }, function(err) {
                if(!err) {
                    bcrypt.hash(data.pass, 10, function(err, hash) {
                        if(!err) {
                            var sql = "INSERT INTO `USER` (`NOMUSR`, `PRENOMUSR`, `EMAIL`, `PASSWORD`, `CREATED`, `MODIFIED`) VALUES ('"
                                    + data.nom + "', '" + data.prenom + "', '" + data.mail + "', '" + hash + "', CURDATE(), null)";
                            requestLogger.info(sql);
                            db.query(sql, function(err, result) {
                                if(!err) {
                                    message = "Compte crée. Vous pouvez désormais vous connecter.";
                                    res.render('signup', {message: message});
                                } else {
                                    message = "Une erreur est survenue, veuillez contacter le support.";
                                    logger.error("Register attempt from [" + req.ip + "] failed.");
                                    res.render('signup', {message: message});
                                }
                            });
                        }
                    });
                } else {
                    logger.error(err);
                }
            });
        }
    } else {
        res.render('signup', {message: message});
    }
}

//Login
exports.login = async function(req, res) {
    var message = "";
    if(req.method == "POST") {
        var data = req.body;
        var mail = data.mail;
        var password = data.pass;
        exist(mail).then(function (personn) {
            bcrypt.compare(password, personn.PASSWORD, function(err, resHash) {
                if(resHash) {;
                    logger.info("[" + personn.NUMUSR + "- " + personn.NOMUSR.toUpperCase() + " " + personn.PRENOMUSR + "] Connected from [" + req.ip + "].");
                    token = jwt.sign(JSON.parse(JSON.stringify(personn)), process.env.SECRET_KEY, {
                        expiresIn: 3600
                    });
                    var cookies = [];
                    cookies.push(cookie.serialize('token', token));
                    cookies.push(cookie.serialize('personn', JSON.stringify(personn)));
                    res.setHeader('Set-Cookie', cookies, {
                        httpOnly: true,
                        maxAge: 60 * 60 //1h
                    });
                    res.redirect('create');
                } else {
                    message = "Mot de passe incorrect, veuillez réessayer.";
                    logger.error("Connection attempt from [" + req.ip + "] failed. (wrong password)");
                    res.render('index', {message: message});
                }
            });
        }, function(err) {
            if(!err) {
                message = "Adresse inexistante.";
                logger.error("Connection attempt from [" + req.ip + "] failed. (adress doesn't exist)");
                res.render('index', {message: message});
            } else {
                logger.error(err);
            }
        });
    } else res.redirect('/');
}

//Logout
exports.logout = function(req, res) {
    if(req.method == "POST") {
        //
    }  else {
        var cookies = cookie.parse(req.headers.cookie || '');
        var token = cookies.token;
        var personn = JSON.parse(cookies.personn);
        if (token && token != "null") {
            jwt.verify(token, process.env.SECRET_KEY, function(err) {
                if (!err) {
                    res.setHeader('Set-Cookie', cookie.serialize('token', token, {expires: new Date()}));
                    logger.info("[" + personn.NUMUSR + "- " + personn.NOMUSR.toUpperCase() + " " + personn.PRENOMUSR + "] Disconnected from [" + req.ip + "].");
                }
            });
        }
        res.redirect('/');
    }
}

//Create recipe
exports.create = function(req, res) {
    if(req.method == "POST") {
        logger.info("Request send from [" + req.ip + "]");
        requestLogger.info("From [" + req.ip + "] Request :\n" + JSON.stringify(req.body));
        res.redirect('/');
    } else {
        var cookies = cookie.parse(req.headers.cookie || '');
        var token = cookies.token;
        if (token && token != "null") {
            jwt.verify(token, process.env.SECRET_KEY, function(err) {
                if (!err) res.render('create')
            });
        } else {
            res.redirect('/');
        }
    }
}

//List of recipes
exports.recettes = function(req, res) {
    if(req.method == "POST") {
        //
    } else {
        var cookies = cookie.parse(req.headers.cookie || '');
        var token = cookies.token;
        if (token && token != "null") {
            jwt.verify(token, process.env.SECRET_KEY, function(err) {
                if (!err) res.render('menu')
            });
        } else {
            res.redirect('/');
        }
    }
}

//Menu
exports.menu = function(req, res) {
    if(req.method =="POST") {
        //
    } else {
        var cookies = cookie.parse(req.headers.cookie || '');
        var token = cookies.token;
        if (token && token != "null") {
            jwt.verify(token, process.env.SECRET_KEY, function(err) {
                if (!err) res.render('menu')
            });
        } else {
            res.redirect('/');
        }
    }
}

//Check if the user exist in the database
function exist(mail) {
    return new Promise((resolve, reject) => {
        var sql = "SELECT * FROM `USER` WHERE `EMAIL`='" + mail + "'";
        requestLogger.info(sql);
        db.query(sql, function(err, rows) {
            if(!err) {
                if(rows.length > 0) resolve(rows[0]);
                else reject();
            }
            else reject(err);
        });
    });
}