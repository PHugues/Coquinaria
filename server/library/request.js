module.exports = {

    /**
     * Check if something already exists (return true if something is find, false otherwise)
     * @param {String} sql SQL request
     * @param {Array<String|Number>} params Array of parameters
     * @param {Function} onComplete Callback Function
     */
    ExistSql: function(sql, params, onComplete) {
        return new Promise(async (resolve, reject) => {
            try {
                this.LogRequest(sql, params);
                let result = await new Promise((resolve, reject) => {
                    db.query(sql, params, function(err, result) {
                        if(err) reject(err);
                        else resolve(result);
                    });
                });
                let res = result[0] && result[0][1] === 1;
                onComplete ? onComplete({result: true, data: res}) : resolve(res);
            } catch (error) {
                let msg = `[ExistSql] ${error.message || error.error || error}`;
                onComplete ? onComplete({result: false, error: msg}) : reject(msg);
            }
        });
    },

    /**
     * Select a single element from a table
     * @param {String} sql SQL request
     * @param {Array<String|Number>} params Array of parameters
     * @param {Function} onComplete Callback Function
     */
    SelectSql: function(sql, params, onComplete) {
        return new Promise(async (resolve, reject) => {
            try {
                this.LogRequest(sql, params);
                let result = await new Promise((resolve, reject) => {
                    db.query(sql, params, function(err, result) {
                        if(err) reject(err);
                        else resolve(result);
                    });
                });
                let res = result[0] ? Object.values(result[0])[0] : "";
                onComplete ? onComplete({result: true, data: res}) : resolve(res);
            } catch (error) {
                let msg = `[SelectSql] ${error.message || error.error || error}`;
                onComplete ? onComplete({result: false, error: msg}) : reject(msg);
            }
        });
    },

    /**
     * Find multiples elements from table(s)
     * @param {String} sql SQL request
     * @param {Array<String|Number>} params Array of parameters
     * @param {Function} onComplete Callback Function
     */
    FillDataRow: function(sql, params, onComplete) {
        return new Promise(async (resolve, reject) => {
            try {
                this.LogRequest(sql, params);
                let result = await new Promise((resolve, reject) => {
                    db.query(sql, params, function(err, result) {
                        if(err) reject(err);
                        else resolve(result);
                    });
                });
                let res = result[0] ? result[0] : {};
                onComplete ? onComplete({result: true, data: res}) : resolve(res);
            } catch (error) {
                let msg = `[FillDataRow] ${error.message || error.error || error}`;
                onComplete ? onComplete({result: false, error: msg}) : reject(msg);
            }
        });
    },

    /**
     * Find all rows that matches the request
     * @param {String} sql SQL request
     * @param {Array<String|Number>} params Array of parameters
     * @param {Function} onComplete Callback Function
     */
    FillDataRows: function(sql, params, onComplete) {
        return new Promise(async (resolve, reject) => {
            try {
                this.LogRequest(sql, params);
                let result = await new Promise((resolve, reject) => {
                    db.query(sql, params, function(err, result) {
                        if(err) reject(err);
                        else resolve(result);
                    });
                });
                let res = result ? result : [{}];
                onComplete ? onComplete({result: true, data: res}) : resolve(res);
            } catch (error) {
                let msg = `[FillDataRows] ${error.message || error.error || error}`;
                onComplete ? onComplete({result: false, error: msg}) : reject(msg);
            }
        });
    },

    /**
     * Execute a query and returne the ID of the insert if there is one
     * @param {String} sql SQL request
     * @param {Array<String|Number>} params Array of parameters
     * @param {Function} onComplete Callback Function
     */
    ExecSql: function(sql, params, onComplete) {
        return new Promise(async (resolve, reject) => {
            try {
                this.LogRequest(sql, params);
                let result = await new Promise((resolve, reject) => {
                    db.query(sql, params, function(err, result) {
                        if(err) reject(err);
                        else resolve(result);
                    });
                });
                let res = result.insertId;
                onComplete ? onComplete({result: true, data: res}) : resolve(res);
            } catch (error) {
                let msg = `[ExecSql] ${error.message || error.error || error}`;
                onComplete ? onComplete({result: false, error: msg}) : reject(msg);
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
    },

    /**
     * Begin a transaction in the database.
     * Don't forget to commit or rollback at the end
     * @param {Function} onComplete Callback Function
     */
    BeginTransaction: function(onComplete)  {
        return new Promise(async (resolve, reject) => {
            try {
                await new Promise((resolve, reject) => {
                    db.beginTransaction(function(err) {
                        if(err) reject(err);
                        else resolve();
                    });
                });
                resolve();
            } catch (error) {
                let msg = `[BeginTransaction] ${error.message || error.error || error}`;
                onComplete ? onComplete({result: false, error: msg}) : reject(msg);
            }
        });
    },

    /**
     * Commit the changes done during the transaction to the database.
     * @param {Function} onComplete Callback Function
     */
    Commit: function(onComplete) {
        return new Promise(async (resolve, reject) => {
            try {
                await new Promise((resolve, reject) => {
                    db.commit(function(err) {
                        if(err) reject(err);
                        else resolve();
                    });
                });
                resolve();
            } catch (error) {
                let msg = `[Commit] ${error.message || error.error || error}`;
                onComplete ? onComplete({result: false, error: msg}) : reject(msg);
            }
        });
    },

    /**
     * Cancel all changes done to the database since the beginning of the transaction.
     * @param {Function} onComplete Callback Function
     */
    Rollback: function(onComplete) {
        return new Promise(async (resolve, reject) => {
            try {
                await new Promise((resolve, reject) => {
                    db.rollback(function(err) {
                        if(err) reject(err);
                        else resolve();
                    });
                });
                resolve();
            } catch (error) {
                let msg = `[Rollback] ${error.message || error.error || error}`;
                onComplete ? onComplete({result: false, error: msg}) : reject(msg);
            }
        });
    }
}