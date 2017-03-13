/**
 * Created by racoon on 2017/3/12.
 */
var mysqlConn = require('../config/maria_db_config')

export function select_from_g_user(req, res, next) {
    mysqlConn.query({
            sql: 'select * from g_user'
        },
        function (err, rows, fields) {
            if (err) throw err;
            res.send(200, res.json(rows));
        });
    return next;
};