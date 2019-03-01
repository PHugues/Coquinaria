var request = require('./request');

module.exports = {

    /**
     * Check if the user exist in the database with his email
     * @param {String} email Mail to verify the existence
     */
    exist: async function(email) {
        try {
            let sql = "SELECT * FROM `USER` WHERE `EMAIL`=? AND `ACTIVE`=1";
            let params = [email];
            let exist = await request.FillDataRow(sql, params);
            return exist;
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
            let catRecipe = await request.SelectSql("SELECT NUMCATREC FROM CATREC WHERE NAMECATREC=?", [data.cat_rec]);
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
            let recID = await request.ExecSql(sql, [recipeName, catRecipe, userID, recipeTime, description, instruction]);

            //Check if the ingredients already exists, if not add them to the ingredients database
            //and then add them to the list of ingredients for the recipe.
            for(let ing of ings) {
                sql = "SELECT * FROM `ING` WHERE `LABING`=?";
                let result = await request.FillDataRow(sql, [ing.ing]);
                if(!result.hasOwnProperty("NUMING")) {
                    sql = "INSERT INTO `ING`(`LABING`) VALUES (?)";
                    let ingID = await request.ExecSql(sql, [ing.ing]);
                    sql = "INSERT INTO `INGREC` (`NUMREC`, `NUMINGREC`, `QTEING`) VALUES (?, ?, ?)";
                    await request.ExecSql(sql, [recID, ingID, ing.qte]);
                } else {
                    let ingID = result["NUMING"];
                    sql = "INSERT INTO `INGREC` (`NUMREC`, `NUMINGREC`, `QTEING`) VALUES (?, ?, ?)";
                    await request.ExecSql(sql, [recID, ingID, ing.qte]);
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
            let data = await request.FillDataRows(sql, [NUMCATREC, NUMUSR]);
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
            let instructions = await request.SelectSql(sql, [NUMREC]);
            // Get the ingredients
            sql = "SELECT ING.LABING, INGREC.QTEING " +
                    "FROM INGREC, ING, REC " +
                    "WHERE REC.NUMREC=? " +
                    "AND REC.NUMREC = INGREC.NUMREC " +
                    "AND ING.NUMING = INGREC.NUMINGREC";
            let ingredients = await request.FillDataRows(sql, [NUMREC]);
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
            await request.ExecSql(sql, [NUMREC]);
            // Remove the recipe
            sql = "DELETE FROM REC WHERE NUMREC=?";
            await request.ExecSql(sql, [NUMREC]);
            return;
        } catch (error) {
            let msg = `[removeRecipe] ${error.message || error.error || error}`;
            logger.error(msg);
            return msg;
        }
    }

}