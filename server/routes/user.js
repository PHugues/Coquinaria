var jwt = require('jsonwebtoken');
var cookie = require('cookie');
var bcrypt = require('bcrypt');
var _Tools = require('../library/tools');
var _Request = require('../library/request');

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
        let message = "";
        if(req.method == "POST") {
            let ip = req.header('x-forwarded-for') || req.connection.remoteAddress || req.headers["X-Real-IP"];
            let data = req.body;
            if(!data.mail.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
                message = "Adresse mail invalide.";
                res.render('signup', {message: message, error: true});
            }
            else if(data.pass != data.pass2) {
                message = "Les mots de passes doivent correspondre.";
                res.render('signup', {message: message, error: true});
            } else {
                let personn = await _Tools.getUser(data.mail);
                if(!personn.isEmpty()) {
                    message = "Cette adresse existe déjà, veuillez réessayer.";
                    logger.error("Register attempt from [" + ip + "] failed.");
                    res.render('signup', {message: message, error: true});
                } else {
                    bcrypt.hash(data.pass, 10, async function(err, hash) {
                        let userID;
                        try {
                            if(!err) {
                                let sql = "INSERT INTO `USER` (`NOMUSR`, `PRENOMUSR`, `EMAIL`, `PASSWORD`, `CREATED`, `MODIFIED`) VALUES (?, ?, ?, ?, CURDATE(), null)";
                                userID = await _Request.ExecSql(sql, [data.nom, data.prenom, data.mail, hash]);
                                message = "Compte crée. Un mail vous a été envoyé afin de confirmer la création de votre compte.";
                                await _Tools.sendVerif(userID, data.mail);
                                res.render('signup', {message: message, error: false});
                            } else res.render('signup', {message: "Veuillez contacter le support.", error: true});
                        } catch (error) {
                            await _Request.ExecSql("DELETE FROM USER WHERE NUMUSR=?", [userID]);
                            res.render('signup', {message: "Veuillez contacter le support.", error: true});
                        }
                    });
                }
            }
        } else res.render('signup', {message: message});
    },

    login: async function(req, res) {
        let message = "";
        if(req.method == "POST") {
            let data = req.body;
            let mail = data.mail;
            let password = data.pass;
            let ip = req.header('x-forwarded-for') || req.connection.remoteAddress || req.headers["X-Real-IP"];
            let personn = await _Tools.getUser(mail);
            if(personn.isEmpty()) {
                message = "Identifiant ou mot de passe incorrect, veuillez réessayer.";
                logger.error("Connection attempt from [" + ip + "] failed. (wrong password)");
                res.render('index', {message: message});
            } else {
                bcrypt.compare(password, personn.PASSWORD, function(err, resHash) {
                    if(resHash) {;
                        httpLogger.info("[" + personn.NUMUSR + "- " + personn.NOMUSR.toUpperCase() + " " + personn.PRENOMUSR + "] Connected from [" + ip + "].");
                        token = jwt.sign(JSON.parse(JSON.stringify(personn)), process.env.SECRET_KEY, {
                            expiresIn: 3600*24
                        });
                        let cookies = [];
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
            }
        } else res.redirect('/');
    },

    logout: function(req, res) {
        if(req.method == "GET") {
            let cookies = cookie.parse(req.headers.cookie || '');
            let token = cookies.token;
            let personn = cookies.personn ? JSON.parse(cookies.personn) : {};
            let ip = req.header('x-forwarded-for') || req.connection.remoteAddress || req.headers["X-Real-IP"];
            if (token && token != "null") {
                jwt.verify(token, process.env.SECRET_KEY, function(err) {
                    if (!err) {
                        let cookiesRes = []
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
            let cookies = cookie.parse(req.headers.cookie || '');
            let personn = cookies.personn ? JSON.parse(cookies.personn) : {};
            let ip = req.header('x-forwarded-for') || req.connection.remoteAddress || req.headers["X-Real-IP"];
            logger.info(`[CREATE RECIPE] From [${ip}] Data :\n${JSON.stringify(req.body)}`);
            let data = req.body;
            data["NUMUSR"] = personn.NUMUSR;
            _Tools.addRecipe(data);
            res.redirect('/');
        } else {
            let cookies = cookie.parse(req.headers.cookie || '');
            let token = cookies.token;
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
            let cookies = cookie.parse(req.headers.cookie || '');
            let token = cookies.token;
            if (token && token != "null") {
                jwt.verify(token, process.env.SECRET_KEY, function(err) {
                    if (!err) res.render('categories')
                });
            } else {
                res.redirect('/');
            }
        }
    },

    recipesCat: async function(req, res) {
        if(req.method == "GET") {
            let recipe = await _Request.FillDataRow("Select NUMCATREC, LABCATREC  From CATREC Where NAMECATREC=?", [req.params.cat]);
            let categorie = recipe["LABCATREC"];
            let catRecipe = recipe["NUMCATREC"];
            let cookies = cookie.parse(req.headers.cookie || '');
            let token = cookies.token;
            let personn = cookies.personn ? JSON.parse(cookies.personn) : {};
            if (token && token != "null") {
                jwt.verify(token, process.env.SECRET_KEY, async function(err) {
                    if (!err) {
                        let result = await _Tools.getRecipes(catRecipe, personn.NUMUSR);
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
            let cookies = cookie.parse(req.headers.cookie || '');
            let token = cookies.token;
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
            let NUMREC = parseInt(req.query.id);
            await _Tools.removeRecipe(NUMREC);
            res.send(true);
        }
    },

    modifyRecipe: function(req, res) {
        if(req.method =="GET") {
            let cookies = cookie.parse(req.headers.cookie || '');
            let token = cookies.token;
            if (token && token != "null") {
                jwt.verify(token, process.env.SECRET_KEY, function(err) {
                    if (!err) res.render('modify');
                });
            } else {
                res.redirect('/');
            }
        } else if(req.method == "POST") {
            let cookies = cookie.parse(req.headers.cookie || '');
            let personn = cookies.personn ? JSON.parse(cookies.personn) : {};
            let NUMREC = parseInt(req.query.id);
            let data = req.body;
            data["NUMREC"] = NUMREC;
            data["NUMUSR"] = personn.NUMUSR;
            _Tools.modifyRecipe(data);
            res.redirect('/');
        }
    },

    recipe: async function(req, res) {
        if(req.method == "GET") {  
            let NUMREC = req.query.id;
            let data = await _Tools.getRecipe(NUMREC);
            res.send(data);
        }
    },

    verifyUser: async function(req, res) {
        if(req.method == "GET") {
            await _Request.ExecSql("UPDATE USER SET ACTIVE=1 WHERE MAILID=?", [req.query.id]);
            await _Request.ExecSql("UPDATE USER SET MAILID=NULL WHERE MAILID=?", [req.query.id]);
            res.redirect('/');
        }
    },

    sendRecipe: async function(req, res) {
        if(req.method == "POST") {
            res.send(await _Tools.sendRecipe(req.query.id, req.query.mail));
        }
    }
}
