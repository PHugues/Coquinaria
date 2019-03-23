module.exports = {

    /**
     * Check if something already exists (return true if something is find, false otherwise)
     * @param {String} sql SQL request
     * @param {Array<String|Number>} params Array of parameters
     */
    ExistSql: function(sql, params) {
        return new Promise(async (resolve, reject) => {
            try {
                this.LogRequest(sql, params);
                let result = await new Promise((resolve, reject) => {
                    db.query(sql, params, function(err, result) {
                        if(err) reject(err);
                        else resolve(result);
                    });
                });
                result[0] && result[0][1] === 1 ? resolve(true) : resolve(false);
            } catch (error) {
                let msg = `[ExistSql] ${error.message || error.error || error}`;
                reject(msg);
            }
        });
    },

    /**
     * Select a single element from a table
     * @param {String} sql SQL request
     * @param {Array<String|Number>} params Array of parameters
     */
    SelectSql: function(sql, params) {
        return new Promise(async (resolve, reject) => {
            try {
                this.LogRequest(sql, params);
                let result = await new Promise((resolve, reject) => {
                    db.query(sql, params, function(err, result) {
                        if(err) reject(err);
                        else resolve(result);
                    });
                });
                result[0] ? resolve(Object.values(result[0])[0]) : resolve("");
            } catch (error) {
                let msg = `[SelectSql] ${error.message || error.error || error}`;
                reject(msg);
            }
        });
    },

    /**
     * Find multiples elements from table(s)
     * @param {String} sql SQL request
     * @param {Array<String|Number>} params Array of parameters
     */
    FillDataRow: function(sql, params) {
        return new Promise(async (resolve, reject) => {
            try {
                this.LogRequest(sql, params);
                let result = await new Promise((resolve, reject) => {
                    db.query(sql, params, function(err, result) {
                        if(err) reject(err);
                        else resolve(result);
                    });
                });
                result[0] ? resolve(result[0]) : resolve({});
            } catch (error) {
                let msg = `[FillDataRow] ${error.message || error.error || error}`;
                reject(msg);
            }
        });
    },

    /**
     * Find all rows that matches the request
     * @param {String} sql SQL request
     * @param {Array<String|Number>} params Array of parameters
     */
    FillDataRows: function(sql, params) {
        return new Promise(async (resolve, reject) => {
            try {
                this.LogRequest(sql, params);
                let result = await new Promise((resolve, reject) => {
                    db.query(sql, params, function(err, result) {
                        if(err) reject(err);
                        else resolve(result);
                    });
                });
                result ? resolve(result) : resolve([{}]);
            } catch (error) {
                let msg = `[FillDataRows] ${error.message || error.error || error}`;
                reject(msg);
            }
        });
    },

    /**
     * Execute a query and returne the ID of the insert if there is one
     * @param {String} sql SQL request
     * @param {Array<String|Number>} params Array of parameters
     */
    ExecSql: function(sql, params) {
        return new Promise(async (resolve, reject) => {
            try {
                this.LogRequest(sql, params);
                let result = await new Promise((resolve, reject) => {
                    db.query(sql, params, function(err, result) {
                        if(err) reject(err);
                        else resolve(result);
                    });
                });
                result.insertId ? resolve(result.insertId) : resolve();
            } catch (error) {
                let msg = `[ExecSql] ${error.message || error.error || error}`;
                reject(msg);
            }
        })
    },

    /**
     * Mogrify the request and log it
     * @param {String} sql SQL request
     * @param {Array<String|Number>} params Array of parameters
     */
    LogRequest: function(sql, params) {
        let msg = "";
        let array = sql.split('?');
        for(let i = 0 ; i < (array.length - 1) ; i++) {
            msg += `${array[i]}${(typeof params[i] === 'string') ? "\"" + params[i] + "\"" : params[i]}`
        }
        msg += array[array.length-1]
        requestLogger.info(msg);
    }
}