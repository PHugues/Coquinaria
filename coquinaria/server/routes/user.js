exports.signup = function(req, res) {
    var message = "";
    if(req.method == "POST") {
        var post = req.body;
        if(post.pass != post.pass2) {
            message = "Les mots de passes doivent correspondre."
            res.render('signup', {message: message});
        } else {
            var sql = "INSERT INTO `USER` (`NOMUSR`, `PRENOMUSR`, `EMAIL`, `PASSWORD`, `CREATED`, `MODIFIED`) VALUES ('"
                    + post.nom + "', '" + post.prenom + "', '" + post.mail + "', '" + post.pass + "', CURDATE(), null)";
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
    } else {
        res.render('signup', {message: message});
    }
}

exports.login = function(req, res) {
    var message = "";
    var appData = {};
    if(req.method == "POST") {
        var post = req.body;
        var mail = post.mail;
        var password = post.pass;
        var sql = "SELECT * FROM `USER` WHERE `EMAIL`='" + mail + "'";
        requestLogger.info(sql);
        db.query(sql, function(err, rows) {
            if(!err) {
                if(rows.length > 0) {
                    if(rows[0].PASSWORD == password) {
                        var personn = rows[0];
                        logger.info("[" + personn.NUMUSR + "- " + personn.NOMUSR.toUpperCase() + " " + personn.PRENOMUSR + "] Connected from [" + req.ip + "].");
                        token = jwt.sign(JSON.parse(JSON.stringify(personn)), process.env.SECRET_KEY, {
                            expiresIn: 3600
                        });
                        res.setHeader('Set-Cookie', cookie.serialize('token', token, {
                            httpOnly: true,
                            maxAge: 60 * 60 //1h
                        }));
                        res.redirect('create');
                    } else {
                        message = "Mot de passe incorrect, veuillez réessayer.";
                        logger.error("Connection attempt from [" + req.ip + "] failed. (wrong password)");
                        res.render('index', {message: message});
                    }
                } else {
                    message = "Adresse inexistante.";
                    logger.error("Connection attempt from [" + req.ip + "] failed. (adress doesn't exist)");
                    res.render('index', {message: message});
                }
            }
        });
    } else res.redirect('/');
}