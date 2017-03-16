/**
 * Created by racoon on 2017/3/12.
 */
var db = {}
// 连接mysql
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 10,
    host: '123.207.169.176',
    user: 'root',
    password: 'root',
    database: 'mcw_demo'
});

//获取连接
db.getConnection = function (callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            callback(null);
            return;
        }
        callback(connection);
    });
}
module.exports = db;