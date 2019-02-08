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
            if (!err) res.redirect('/recipes')
        });
    } else {
        res.render('index', {message: ''});
    }
}

//Signup 
exports.signup = async function(req, res) {
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
}

//Login
exports.login = async function(req, res) {
    var message = "";
    if(req.method == "POST") {
        var data = req.body;
        var mail = data.mail;
        var password = data.pass;
        var ip = req.header('x-forwarded-for') || req.connection.remoteAddress || req.headers["X-Real-IP"];
        exist(mail).then(function (personn) {
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
}

//Logout
exports.logout = function(req, res) {
    if(req.method == "POST") {
        //
    }  else {
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
                    httpLogger.info("[" + personn.NUMUSR + "- " + personn.NOMUSR.toUpperCase() + " " + personn.PRENOMUSR + "] Disconnected from [" + ip + "].");
                }
            });
        }
        res.redirect('/');
    }
}

//Create recipe
exports.create = function(req, res) {
    if(req.method == "POST") {
        var cookies = cookie.parse(req.headers.cookie || '');
        var personn = cookies.personn ? JSON.parse(cookies.personn) : {};
        var ip = req.header('x-forwarded-for') || req.connection.remoteAddress || req.headers["X-Real-IP"];
        logger.info("Request send from [" + ip + "]");
        logger.info("From [" + ip + "] Data :\n" + JSON.stringify(req.body));
        var data = req.body;
        data["NUMUSR"] = personn.NUMUSR;
        addRecipe(data, function(res2) {
            res.redirect('/');
        });
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
                if (!err) res.render('recette')
            });
        } else {
            res.redirect('/');
        }
    }
}

//List of meals
exports.meals = function(req, res) {
    if(req.method == "POST") {  
        //
    } else {
        var cookies = cookie.parse(req.headers.cookie || '');
        var token = cookies.token;
        var personn = cookies.personn ? JSON.parse(cookies.personn) : "";
        if (token && token != "null") {
            jwt.verify(token, process.env.SECRET_KEY, function(err) {
                if (!err) {
                    getRecipes("plats", personn.NUMUSR, function(res2) {
                        res.render('meals', {data: res2.data});
                    });
                }
            });
        } else {
            res.redirect('/');
        }
    }
}

//List of entrees
exports.entrees = function(req, res) {
    if(req.method == "POST") {  
        //
    } else {
        var cookies = cookie.parse(req.headers.cookie || '');
        var token = cookies.token;
        var personn = cookies.personn ? JSON.parse(cookies.personn) : {};
        if (token && token != "null") {
            jwt.verify(token, process.env.SECRET_KEY, function(err) {
                if (!err) {
                    getRecipes("entrees", personn.NUMUSR, function(res2) {
                        res.render('entrees', {data: res2.data});
                    });
                }
            });
        } else {
            res.redirect('/');
        }
    }
}

//List of sauces
exports.sauces = function(req, res) {
    if(req.method == "POST") {  
        //
    } else {
        var cookies = cookie.parse(req.headers.cookie || '');
        var token = cookies.token;
        var personn = cookies.personn ? JSON.parse(cookies.personn) : {};
        if (token && token != "null") {
            jwt.verify(token, process.env.SECRET_KEY, function(err) {
                if (!err) {
                    getRecipes("sauces", personn.NUMUSR, function(res2) {
                        res.render('sauces', {data: res2.data});
                    });
                }
            });
        } else {
            res.redirect('/');
        }
    }
}

//List of biscuits
exports.biscuits = function(req, res) {
    if(req.method == "POST") {  
        //
    } else {
        var cookies = cookie.parse(req.headers.cookie || '');
        var token = cookies.token;
        var personn = cookies.personn ? JSON.parse(cookies.personn) : {};
        if (token && token != "null") {
            jwt.verify(token, process.env.SECRET_KEY, function(err) {
                if (!err) {
                    getRecipes("biscuits", personn.NUMUSR, function(res2) {
                        res.render('biscuits', {data: res2.data});
                    });
                }
            });
        } else {
            res.redirect('/');
        }
    }
}

//List of cakes
exports.cakes = function(req, res) {
    if(req.method == "POST") {  
        //
    } else {
        var cookies = cookie.parse(req.headers.cookie || '');
        var token = cookies.token;
        var personn = cookies.personn ? JSON.parse(cookies.personn) : {};
        if (token && token != "null") {
            jwt.verify(token, process.env.SECRET_KEY, function(err) {
                if (!err) {
                    getRecipes("gateaux", personn.NUMUSR, function(res2) {
                        res.render('cakes', {data: res2.data});
                    });
                }
            });
        } else {
            res.redirect('/');
        }
    }
}

//List of breads
exports.breads = function(req, res) {
    if(req.method == "POST") {  
        //
    } else {
        var cookies = cookie.parse(req.headers.cookie || '');
        var token = cookies.token;
        var personn = cookies.personn ? JSON.parse(cookies.personn) : {};
        if (token && token != "null") {
            jwt.verify(token, process.env.SECRET_KEY, function(err) {
                if (!err) {
                    getRecipes("boulangerie", personn.NUMUSR, function(res2) {
                        res.render('breads', {data: res2.data});
                    });
                }
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

// Remove recipe
exports.removeRecipe = function(req, res) {
    if(req.method == "POST") {
        var NUMREC = req.params.id;
        remRecipe(NUMREC, function(res2) {
            if(!res2.result) {
                res.sendStatus(500);
                res.send(res2);
            } else {
                res.send(res2);
            }
        });
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

//Add a recipe to the database
function addRecipe(data, onComplete) {
    //Parse the data send
    var nameRecipe = data.nom_recette;
    var timeRecipe = data.temps;
    var description = data.description;
    var catRecipe;
    switch(data.cat_rec) {
        case "entrees": {
            catRecipe = 1;
            break;
        }
        case "plats": {
            catRecipe = 2;
            break;
        }
        case "biscuits": {
            catRecipe = 3;
            break;
        }
        case "gateaux": {
            catRecipe = 4;
            break;
        }
        case "boulangerie": {
            catRecipe = 5;
            break;
        }
        case "sauces": {
            catRecipe = 6;
            break;
        }
        default: {
            catRecipe = 0;
            break;
        }
    }
    var ings = [];
    if(Array.isArray(data.nom_ing)) {
        for(var i = 0 ; i < data.nom_ing.length ; i++) {
            ings.push({ing: data.nom_ing[i], qte: data.qte_ing[i]});
        }
    } else {
        ings.push({ing: data.nom_ing, qte: data.qte_ing});
    }
    var instruction = data.inst;
    var recID;
    var ingID;
    var userID = data.NUMUSR;

    Promise.resolve()
    .then(() => { return new Promise((resolve, reject) => {
        //Insert the recipe in the database
        var sql = "INSERT INTO `REC` (`LABREC`, `NUMCATREC`, `NUMUSR`, `TPSREC`, `DESREC`, `TXTREC`) VALUES('" +
                nameRecipe + "', " + catRecipe + ", " + userID + ", " + timeRecipe + ", \"" + description + "\", \"" + instruction + "\")";
        requestLogger.info(sql);
        db.query(sql, function(err, result) {
            if(err) reject(err);
            else {
                recID = result.insertId;
                resolve();
            }
        });
    });})
    .then(() => { return new Promise((resolve, reject) => {
        //Check if the ingredients already exists, if not add them to the ingredients database
        //and then add them to the list of ingredients for the recipe.
        const start = async() => {
            await asyncForEach(ings, async (ing) => {
                var sql = "SELECT * FROM `ING` WHERE `LABING`='" + ing.ing + "';"
                requestLogger.info(sql);
                db.query(sql, function(err, result) {
                    if(err) reject(err);
                    else {
                        if(result.length == 0) {
                            var sqlInsert = "INSERT INTO `ING` (`LABING`) VALUES ('" + ing.ing + "')";
                            requestLogger.info(sqlInsert);
                            db.query(sqlInsert, function(err, result) {
                                if(err) reject(err);
                                else {
                                    ingID = result.insertId;
                                    var sqlIns = "INSERT INTO `INGREC` (`NUMREC`, `NUMINGREC`, `QTEING`) VALUES (" + recID + ", " + ingID + ", " + ing.qte + ")";
                                    requestLogger.info(sqlIns);
                                    db.query(sqlIns, function(err, result) {
                                        if(err) reject(err)
                                        else resolve();
                                    })
                                }
                            });
                        } else {
                            ingID = result.insertId;
                            var sqlIns = "INSERT INTO `INGREC` (`NUMREC`, `NUMINGREC`, `QTEING`) VALUES (" + recID + ", " + ingID + ", " + ing.qte + ")";
                            requestLogger.info(sqlIns);
                            db.query(sqlIns, function(err, result) {
                                if(err) reject(err)
                                else resolve();
                            });
                        }
                    }
                });
            });
        };
        start();
    });})
    .then (succes => {
       onComplete({result: true});
    },
    err => {
      onComplete({result: false, error: err});
    });
}

//Get the recipes from one categorie
function getRecipes(cat, numUsr, onComplete) {
    Promise.resolve()
    .then(() => { return new Promise((resolve, reject) => {
        var catRecipe;
        switch(cat) {
            case "entrees": {
                catRecipe = 1;
                break;
            }
            case "plats": {
                catRecipe = 2;
                break;
            }
            case "biscuits": {
                catRecipe = 3;
                break;
            }
            case "gateaux": {
                catRecipe = 4;
                break;
            }
            case "boulangerie": {
                catRecipe = 5;
                break;
            }
            case "sauces": {
                catRecipe = 6;
                break;
            }
            default: {
                catRecipe = 0;
                break;
            }
        }
        var sql = "SELECT REC.LABREC, REC.TPSREC, REC.DESREC, REC.NUMREC " +
                    "FROM REC, CATREC, USER " +
                    "WHERE CATREC.NUMCATREC = " + catRecipe +
                    " AND REC.NUMUSR = " + numUsr +
                    " AND REC.NUMCATREC = CATREC.NUMCATREC " +
                    "AND REC.NUMUSR = USER.NUMUSR";
        requestLogger.info(sql);
        db.query(sql, function(err, rows) {
            if(!err) resolve(rows);
            else reject();
        });        
    });})
    .then (succes => {
       onComplete({ result: true, data: succes});
    },
    err => {
       onComplete({ result: false, error: err.message || err.error || err});
    });
}

function remRecipe(numRec, onComplete) {
    Promise.resolve()
    .then(() => { return new Promise((resolve, reject) => {
        // Remove all ingredients
        var sql = "DELETE FROM INGREC WHERE NUMREC=" + numRec;
        requestLogger.info(sql);
        db.query(sql, function(err, rows) {
            if(!err) resolve();
            else reject(err);
        })
    });})
    .then(() => { return new Promise((resolve, reject) => {
        // Remove the recipe
        var sql = "DELETE FROM REC WHERE NUMREC=" + numRec;
        requestLogger.info(sql);
        db.query(sql, function(err, rows) {
            if(!err) resolve();
            else reject(err);
        })
    });})
    .then (succes => {
       onComplete({ result: true });
    },
    err => {
       onComplete({ result: false, error: err.message || err.error || err});
    });
}

//Async loop
async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}