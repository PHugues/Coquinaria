var _Request = require('./request');
var _Mail = require('./mail')
var fs = require('fs');

module.exports = {

    /**
     * Return the user
     * @param {String} email Mail to verify the existence
     */
    getUser: async function(email) {
        try {
            let sql = "SELECT * FROM `USER` WHERE `EMAIL`=? AND `ACTIVE`=1";
            let params = [email];
            let user = await _Request.FillDataRow(sql, params);
            return user;
        } catch (error) {
            let msg = `[getUser] ${error.message || error.error || error}`;
            logger.error(msg);
            return msg;
        }
    },

    /**
     * Add a recipe to the database
     * @param {Object} data Data recovered from the form and the cookies
     */
    addRecipe: async function(data) {
        try {
            // Parse the data send
            let recipeName = data.nom_recette;
            let recipeTime = data.temps;
            let description = data.description;
            let catRecipe = await _Request.SelectSql("SELECT NUMCATREC FROM CATREC WHERE NAMECATREC=?", [data.cat_rec]);
            let instruction = data.inst;
            let userID = data.NUMUSR ? data.NUMUSR : 11;
            let ings = [];
            if(Array.isArray(data.nom_ing)) {
                for(let i = 0 ; i < data.nom_ing.length ; i++) {
                    ings.push({ing: data.nom_ing[i], qte: data.qte_ing[i]});
                }
            } else ings.push({ing: data.nom_ing, qte: data.qte_ing});

            // Insert the recipe in the database
            let sql = "INSERT INTO `REC` (`LABREC`, `NUMCATREC`, `NUMUSR`, `TPSREC`, `DESREC`, `TXTREC`) VALUES(?, ?, ?, ?, ?, ?)";
            let recID = await _Request.ExecSql(sql, [recipeName, catRecipe, userID, recipeTime, description, instruction]);

            // Check if the ingredients already exists, if not add them to the ingredients database
            // and then add them to the list of ingredients for the recipe.
            for(let ing of ings) {
                sql = "SELECT * FROM `ING` WHERE `LABING`=?";
                let result = await _Request.FillDataRow(sql, [ing.ing]);
                if(!result.hasOwnProperty("NUMING")) {
                    sql = "INSERT INTO `ING`(`LABING`) VALUES (?)";
                    let ingID = await _Request.ExecSql(sql, [ing.ing]);
                    sql = "INSERT INTO `INGREC` (`NUMREC`, `NUMINGREC`, `QTEING`) VALUES (?, ?, ?)";
                    await _Request.ExecSql(sql, [recID, ingID, ing.qte]);
                } else {
                    let ingID = result["NUMING"];
                    sql = "INSERT INTO `INGREC` (`NUMREC`, `NUMINGREC`, `QTEING`) VALUES (?, ?, ?)";
                    await _Request.ExecSql(sql, [recID, ingID, ing.qte]);
                }
            }
        } catch (error) {
            let msg = `[addRecipe] ${error.message || error.error || error}`;
            logger.error(msg);
            return msg;
        }
    },
    
    /**
     * Get the recipes from one categorie
     * @param {Number} NUMCATREC ID of the categorie
     * @param {Number} NUMUSR ID of the user
     */
    getRecipes: async function(NUMCATREC, NUMUSR) {
        try {
            let sql = "SELECT REC.LABREC, REC.TPSREC, REC.DESREC, REC.NUMREC " +
                    "FROM REC, CATREC, USER " +
                    "WHERE CATREC.NUMCATREC = ?" +
                    " AND REC.NUMUSR = ?" +
                    " AND REC.NUMCATREC = CATREC.NUMCATREC " +
                    "AND REC.NUMUSR = USER.NUMUSR";
            let data = await _Request.FillDataRows(sql, [NUMCATREC, NUMUSR]);
            return data;
        } catch (error) {
            let msg = `[getRecipes] ${error.message || error.error || error}`;
            logger.error(msg);
            return msg;
        }
    },

    /**
     * Get the information from a single recipe
     * @param {Number} NUMREC ID of the recipe
     */
    getRecipe: async function(NUMREC) {
        try {
            // Get the instructions
            let sql = "SELECT REC.TXTREC FROM REC WHERE REC.NUMREC=?";
            let instructions = await _Request.SelectSql(sql, [NUMREC]);
            // Get the ingredients
            sql = "SELECT ING.LABING, INGREC.QTEING " +
                    "FROM INGREC, ING, REC " +
                    "WHERE REC.NUMREC=? " +
                    "AND REC.NUMREC = INGREC.NUMREC " +
                    "AND ING.NUMING = INGREC.NUMINGREC";
            let ingredients = await _Request.FillDataRows(sql, [NUMREC]);
            sql = "SELECT REC.LABREC, REC.TPSREC, REC.DESREC, CATREC.NAMECATREC " +
                    "FROM REC, CATREC " +
                    "WHERE REC.NUMREC=? " +
                    "AND REC.NUMCATREC = CATREC.NUMCATREC";
            let info = await _Request.FillDataRow(sql, [NUMREC]);
            return {instruction: instructions, ingredients: ingredients, info: info};
        } catch (error) {
            let msg = `[getRecipe] ${error.message || error.error || error}`;
            logger.error(msg);
            return msg;
        }
    },

    /**
     * Remove a recipe
     * @param {Number} NUMREC ID of the recipe
     */
    removeRecipe: async function(NUMREC) {
        try {
            // Remove the ingredients
            let sql = "DELETE FROM INGREC WHERE NUMREC=?";
            await _Request.ExecSql(sql, [NUMREC]);
            // Remove the recipe
            sql = "DELETE FROM REC WHERE NUMREC=?";
            await _Request.ExecSql(sql, [NUMREC]);
            return;
        } catch (error) {
            let msg = `[removeRecipe] ${error.message || error.error || error}`;
            logger.error(msg);
            return msg;
        }
    },

    /**
     * Modify a recipe from the database
     * @param {Object} data Data recovered from the form and the cookies
     */
    modifyRecipe: async function(data) {
        try {
            // Parse the data send
            let recipeName = data.nom_recette;
            let recipeTime = data.temps;
            let description = data.description;
            let catRecipe = await _Request.SelectSql("SELECT NUMCATREC FROM CATREC WHERE NAMECATREC=?", [data.cat_rec]);
            let instruction = data.inst;
            let userID = data.NUMUSR ? data.NUMUSR : 11;
            let recID = data.NUMREC;
            let ings = [];
            if(Array.isArray(data.nom_ing)) {
                for(let i = 0 ; i < data.nom_ing.length ; i++) {
                    ings.push({ing: data.nom_ing[i], qte: data.qte_ing[i]});
                }
            } else ings.push({ing: data.nom_ing, qte: data.qte_ing});

            // Update the recipe in the database
            let sql = "UPDATE `REC` SET `LABREC`=?, `NUMCATREC`=?, `NUMUSR`=?, `TPSREC`=?, `DESREC`=?, `TXTREC`=? WHERE NUMREC=" + recID;
            await _Request.ExecSql(sql, [recipeName, catRecipe, userID, recipeTime, description, instruction]);

            // Remove all the ingredients linked to the recipe and then re-add them
            sql = "Delete FROM INGREC WHERE NUMREC=?";
            await _Request.ExecSql(sql, [recID]);

            // Re-add the ingredients
            for(let ing of ings) {
                sql = "SELECT * FROM `ING` WHERE `LABING`=?";
                let result = await _Request.FillDataRow(sql, [ing.ing]);
                if(!result.hasOwnProperty("NUMING")) {
                    sql = "INSERT INTO `ING`(`LABING`) VALUES (?)";
                    let ingID = await _Request.ExecSql(sql, [ing.ing]);
                    sql = "INSERT INTO `INGREC` (`NUMREC`, `NUMINGREC`, `QTEING`) VALUES (?, ?, ?)";
                    await _Request.ExecSql(sql, [recID, ingID, ing.qte]);
                } else {
                    let ingID = result["NUMING"];
                    sql = "INSERT INTO `INGREC` (`NUMREC`, `NUMINGREC`, `QTEING`) VALUES (?, ?, ?)";
                    await _Request.ExecSql(sql, [recID, ingID, ing.qte]);
                }
            }
        } catch (error) {
            let msg = `[modifyRecipe] ${error.message || error.error || error}`;
            logger.error(msg);
            return msg;
        }
    },

    /**
     * Send a verification mail to the user so he can activate his account
     * @param {Number} NUMUSR ID of the newly created user
     */
    sendVerif: async function(NUMUSR, mail) {
        return new Promise(async (resolve, reject) => {
            try {
                let rand = Math.floor((Math.random() * 100) + 54);
                await _Request.ExecSql("UPDATE USER SET MAILID=? WHERE NUMUSR=?", [rand, NUMUSR]);
                let link = `https://coquinaria.pierre-hugues.fr/verif?id=${rand}`;
                let body = await new Promise((rs, rj) => {
                    fs.readFile(__dirname + '/../templates/mails/verif.html', 'utf8', (err, data) => {
                        if(err) rj(err);
                        else rs(data);
                    });
                });
                body = body.replace("$LINK", link);
                await _Mail.SendMail({to: mail, subject: 'Veuillez confirmer votre adresse mail', body: body}, true);
                resolve();
            } catch (error) {
                let msg = `[sendVerif] ${error.message || error.error || error}`;
                reject(msg);
            }
        });
    },

    /**
     * Share a recipe to an other user with his email adress
     * @param {String} NUMREC ID of the recipe
     * @param {String} mail Recipient of the recipe
     */
    sendRecipe: async function(NUMREC, mail) {
        return new Promise(async (resolve, reject) => {
            try {
                let recipe = await this.getRecipe(NUMREC);

                let body = await new Promise((rs, rj) => {
                    fs.readFile(__dirname + '/../templates/mails/recipe.html', 'utf8', (err, data) => {
                        if(err) rj(err);
                        else rs(data);
                    });
                });

                body = body.replace("$CATEGORIE", recipe.info.NAMECATREC.toUpperCase());
                body = body.replace("$NAME", recipe.info.LABREC);
                body = body.replace("$DESCRIPTION", recipe.info.DESREC);
                body = body.replace("$TEMPS", recipe.info.TPSREC);
                body = body.replace("$INSTRUCTION", recipe.instruction.replace(/\n/gmi, "<br />"));

                for(let i = 0 ; i < recipe.ingredients.length ; i++) {
                    let ing = recipe.ingredients[i];
                    body = body.replace("$ING", "<li>" + ing["QTEING"] + " " + ing["LABING"] + "</li>" + `<hr width="100%" size=1 align="left">$ING`);
                }
                body = body.replace("$ING", "");

                await _Mail.SendMail({to: mail, subject: 'Recette partagée', body: body}, true)
                resolve(true);
            } catch (error) {
                let msg = `[sendRecipe] ${error.message || error.error || error}`;
                reject(msg);
            }
        });
    }
}