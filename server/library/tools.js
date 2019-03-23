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
            let msg = `[exist] ${error.message || error.error || error}`;
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

            //Insert the recipe in the database
            let sql = "INSERT INTO `REC` (`LABREC`, `NUMCATREC`, `NUMUSR`, `TPSREC`, `DESREC`, `TXTREC`) VALUES(?, ?, ?, ?, ?, ?)";
            let recID = await _Request.ExecSql(sql, [recipeName, catRecipe, userID, recipeTime, description, instruction]);

            //Check if the ingredients already exists, if not add them to the ingredients database
            //and then add them to the list of ingredients for the recipe.
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
            return {instruction: instructions, ingredients: ingredients};
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
     * Send a verification mail to the user so he can activate his account
     * @param {Number} NUMUSR ID of the newly created user
     */
    sendVerif: async function(NUMUSR, mail) {
        return new Promise(async (resolve, reject) => {
            try {
                let body = await new Promise((rs, rj) => {
                    fs.readFile(__dirname + '/../templates/mails/verif.html', 'utf8', (err, data) => {
                        if(err) rj(err);
                        else rs(data);
                    });
                });
                await _Mail.SendMail({to: mail, subject: 'Veuillez confirmer votre adresse mail', body: body}, true);
                resolve();
            } catch (error) {
                let msg = `[sendVerif] ${error.message || error.error || error}`;
                reject(msg);
            }
        });
    }
}