var jwt = require('jsonwebtoken');
var cookie = require('cookie');
var bcrypt = require('bcrypt');
var tools = require('../library/tools');
var request = require('../library/request');

module.exports = {
    index: function(req, res) {
        let cookies = cookie.parse(req.headers.cookie || '');
        let token = cookies.token;
        if (token) {
            jwt.verify(token, process.env.SECRET_KEY, function(err) {
                if (!err) res.redirect('/recettes')
            });
        } else {
            res.render('index', {message: ''});
        }
    },

    signup: async function(req, res) {
        var message = "";
        if(req.method == "POST") {
            var ip = req.header('x-forwarded-for') || req.connection.remoteAddress || req.headers["X-Real-IP"];
            var data = req.body;
            if(data.pass != data.pass2) {
                message = "Les mots de passes doivent correspondre."
                res.render('signup', {message: message, error: true});
            } else {
                exist(data.mail).then(function (success) {
                        message = "Cette adresse existe déjà, veuillez réessayer.";
                        logger.error("Register attempt from [" + ip + "] failed.");
                        res.render('signup', {message: message, error: true});
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
                                        res.render('signup', {message: message, error: false});
                                    } else {
                                        message = "Une erreur est survenue, veuillez contacter le support.";
                                        logger.error("Register attempt from [" + ip + "] failed.");
                                        res.render('signup', {message: message, error: true});
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
    },

    login: async function(req, res) {
        var message = "";
        if(req.method == "POST") {
            var data = req.body;
            var mail = data.mail;
            var password = data.pass;
            var ip = req.header('x-forwarded-for') || req.connection.remoteAddress || req.headers["X-Real-IP"];
            tools.exist(mail).then(function (personn) {
                bcrypt.compare(password, personn.PASSWORD, function(err, resHash) {
                    if(resHash) {;
                        httpLogger.info("[" + personn.NUMUSR + "- " + personn.NOMUSR.toUpperCase() + " " + personn.PRENOMUSR + "] Connected from [" + ip + "].");
                        token = jwt.sign(JSON.parse(JSON.stringify(personn)), process.env.SECRET_KEY, {
                            expiresIn: 3600*24
                        });
                        var cookies = [];
                        cookies.push(cookie.serialize('token', token));
                        cookies.push(cookie.serialize('personn', JSON.stringify(personn)));
                        res.setHeader('Set-Cookie', cookies, {
                            httpOnly: true,
                            expires: new Date().addDays(1) //24h
                        });
                        res.redirect('/');
                    } else {
                        message = "Identifiant ou mot de passe incorrect, veuillez réessayer.";
                        logger.error("Connection attempt from [" + ip + "] failed. (wrong password)");
                        res.render('index', {message: message});
                    }
                });
            }, function(err) {
                if(!err) {
                    message = "Identifiant ou mot de passe incorrect, veuillez réessayer.";
                    httpLogger.error("Connection attempt from [" + ip + "] failed. (adress doesn't exist)");
                    res.render('index', {message: message});
                } else {
                    logger.error(err);
                }
            });
        } else res.redirect('/');
    },

    logout: function(req, res) {
        if(req.method == "GET") {
            var cookies = cookie.parse(req.headers.cookie || '');
            var token = cookies.token;
            var personn = cookies.personn ? JSON.parse(cookies.personn) : {};
            var ip = req.header('x-forwarded-for') || req.connection.remoteAddress || req.headers["X-Real-IP"];
            if (token && token != "null") {
                jwt.verify(token, process.env.SECRET_KEY, function(err) {
                    if (!err) {
                        var cookiesRes = []
                        cookiesRes.push(cookie.serialize('token', cookies.token, {expires: new Date()}));
                        cookiesRes.push(cookie.serialize('personn', cookies.personne,  {expires: new Date()}));
                        res.setHeader('Set-Cookie', cookiesRes);
                        httpLogger.info(`[${personn.NUMUSR} - ${personn.NOMUSR.toUpperCase()} ${personn.PRENOMUSR}] Disconnected from [${ip}].`);
                    }
                });
            }
            res.redirect('/');
        }
    },

    create: function(req, res) {
        if(req.method == "POST") {
            var cookies = cookie.parse(req.headers.cookie || '');
            var personn = cookies.personn ? JSON.parse(cookies.personn) : {};
            var ip = req.header('x-forwarded-for') || req.connection.remoteAddress || req.headers["X-Real-IP"];
            logger.info(`[CREATE RECIPE] From [${ip}] Data :\n${JSON.stringify(req.body)}`);
            var data = req.body;
            data["NUMUSR"] = personn.NUMUSR;
            tools.addRecipe(data);
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
    },

    recipes: function(req, res) {
        if(req.method == "GET") {  
            var cookies = cookie.parse(req.headers.cookie || '');
            var token = cookies.token;
            if (token && token != "null") {
                jwt.verify(token, process.env.SECRET_KEY, function(err) {
                    if (!err) res.render('recette')
                });
            } else {
                res.redirect('/');
            }
        }
    },

    recipesCat: async function(req, res) {
        if(req.method == "GET") {
            let recipe = await request.FillDataRow("Select NUMCATREC, LABCATREC  From CATREC Where NAMECATREC=?", [req.params.cat]);
            let categorie = recipe["LABCATREC"];
            let catRecipe = recipe["NUMCATREC"];
            let cookies = cookie.parse(req.headers.cookie || '');
            let token = cookies.token;
            let personn = cookies.personn ? JSON.parse(cookies.personn) : {};
            if (token && token != "null") {
                jwt.verify(token, process.env.SECRET_KEY, async function(err) {
                    if (!err) {
                        let result = await tools.getRecipes(catRecipe, personn.NUMUSR);
                        res.render('recipes', {data: result, title: categorie.capitalize()});
                    }
                });
            } else {
                res.redirect('/');
            }
        }
    },

    menu: function(req, res) {
        if(req.method =="GET") {
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
    },

    removeRecipe: async function(req, res) {
        if(req.method == "POST") {
            let NUMREC = parseInt(req.params.id);
            await tools.removeRecipe(NUMREC);
            res.send(true);
        }
    },

    recipe: async function(req, res) {
        if(req.method == "GET") {  
            let NUMREC = req.params.id;
            let data = await tools.getRecipe(NUMREC);
            res.send(data);
        }
    }
}