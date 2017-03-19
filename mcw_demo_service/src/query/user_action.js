/**
 * Created by racoon on 2017/3/12.
 */
var db = require('../config/maria_db_config')

export function select_from_g_user(req, res) {
    db.getConnection(function(connection){
        connection.query({
                sql: 'select gu.user_id as userId,gu.name as name,gu.gender as gender,gu.phone as phone,' +
                'gu.photo_url as photoUrl from g_user gu'
            },
            function (err, rows) {
                var requestResult = {};
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    requestResult.code = 1;
                    requestResult.message = err.message;
                    requestResult.data = {};
                } else {
                    requestResult.code = 0;
                    requestResult.message = 'success';
                    requestResult.data = rows;
                }
                connection.release();
                res.send(200, res.json(requestResult));
            });
    });
};