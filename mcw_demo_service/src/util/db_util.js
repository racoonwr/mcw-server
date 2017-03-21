/**
 * Created by racoon on 2017/3/22.
 */
var db = require('../config/maria_db_config')

export function select_data(sql,input,callback) {
    console.log('sql ', sql);
    console.log('input ', input);
    var result = {};
    db.getConnection(function (connection) {
        connection.query(sql, input, function (err, rows) {
            connection.release()
            if (err) {
                console.log('[SELECT ERROR] - ', err.message);
                result.code = 1;
                result.message = err.message;
                result.data = {};
                callback(err,result);
            } else {
                console.log('SELECT RESULT : ', rows);
                result.code = 0;
                result.message = 'success';
                result.data = rows;
                callback(null,result);
            }
        });
    })
};

export function update_data(sql,input,callback) {
    console.log('sql ', sql);
    console.log('input ', input);
    var result = {};
    db.getConnection(function (connection) {
        connection.query(sql, input, function (err, res) {
            connection.release()
            if (err) {
                console.log('[UPDATE ERROR] - ', err.message);
                result.code = 1;
                result.message = err.message;
                result.data = false;
                callback(err,result);
            } else {
                console.log('UPDATE ROWS : ', res.affectedRows);
                result.code = 0;
                result.message = 'success';
                result.data = true;
                callback(null,result);
            }
        });
    })
};

export function insert_data(sql,input,callback) {
    console.log('sql ', sql);
    console.log('input ', input);
    var result = {};
    db.getConnection(function (connection) {
        connection.query(sql, input, function (err, res) {
            connection.release();
            if (err) {
                console.log('[INSERT ERROR] - ', err.message);
                result.code = 1;
                result.message = err.message;
                result.data = false;
                callback(err,result);
            } else {
                console.log('INSERT ID : ', res);
                result.code = 0;
                result.message = 'success';
                result.data = true;
                callback(null,result);
            }
        });
    });
};