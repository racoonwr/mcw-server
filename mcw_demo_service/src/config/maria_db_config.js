/**
 * Created by racoon on 2017/3/12.
 */
// 连接mysql
var mysql = require('mysql');
const conn = mysql.createConnection({
    host: '123.207.169.176',
    user: 'root',
    password: 'root',
    database: 'mcw_demo',
    port: 3306
});

module.exports = conn;