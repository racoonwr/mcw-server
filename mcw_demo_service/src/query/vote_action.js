/**
 * Created by racoon on 2017/3/14.
 */
var db = require('../config/maria_db_config')
var async = require('async');

export function get_vote_list(req, res) {
    console.log('body = ', req.body);
    var querySql = 'select gv.VOTE_ID as voteId,gv.VOTE_CONTENT as voteContent,gv.ANONYMITY as anonymity,gv.STATUS_CODE as statusCode from g_vote gv where gv.MEETING_ID = ?';
    var inputParams = [req.params.meetingId];

    db.getConnection(function (connection) {
        connection.query(querySql, inputParams,
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
                // connection.release();
                res.send(200, res.json(requestResult));
            });
    })
};

export function get_vote_detail(req, res) {
    console.log('body = ', req.body);
    var querySql = 'select gv.VOTE_ID as voteId,gv.VOTE_CONTENT as voteContent,gv.ANONYMITY as anonymity,gv.STATUS_CODE as statusCode from g_vote gv where gv.vote_id = ?';
    var inputParams = [req.params.voteId];
    db.getConnection(function (connection) {
        connection.query(querySql, inputParams,
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
                // connection.release();
                res.send(200, res.json(requestResult));
            });
    })
};

export function create_vote(req, res) {
    console.log('body = ', req.body);
    var now = new Date();

    var createVoteSql = 'insert into g_vote(vote_id,meeting_id,vote_content,anonymity' +
        ',status_code,created_by,creation_date,last_updated_by,last_update_date,' +
        'record_status,version_number) values (?,?,?,?,?,?,?,?,?,?,?)';

    var inputParams = [req.params.voteId, req.params.meetingId, req.params.voteContent,
        req.params.anonymity, 'INVOTING', req.params.userId, now.getTime(),
        req.params.userId, now.getTime(), 'VALID', 1];

    console.log('createVoteSql ', createVoteSql);
    console.log('inputParams ', inputParams);
    var requestResult = {};
    db.getConnection(function (connection) {
        connection.query(createVoteSql, inputParams, function (err, result) {
            if (err) {
                console.log('[INSERT ERROR] - ', err.message);
                requestResult.code = 1;
                requestResult.message = err.message;
                requestResult.data = false;
            } else {
                console.log('INSERT ID : ', result);
                requestResult.code = 0;
                requestResult.message = 'success';
                requestResult.data = true;
            }
            res.send(200, res.json(requestResult));
        });
    })
};

export function create_votes(req, res) {
    console.log('body = ', req.body);
    var votes = req.params.list;
    var now = new Date();
    var requestResult = {};
    db.getConnection(function (connection) {
        connection.beginTransaction(function (err) {
            if (err) {
                console.log('[INSERT ERROR] - ', err.message);
                requestResult.code = 1;
                requestResult.message = err.message;
                requestResult.data = false;
                res.send(200, res.json(requestResult));
                return;
            }
            var tasks = [];
            for (var i = 0; i < votes.length; i++) {
                (function (vote, index) {

                    var createVoteSql = 'insert into g_vote(vote_id,meeting_id,vote_content,anonymity' +
                        ',status_code,created_by,creation_date,last_updated_by,last_update_date,' +
                        'record_status,version_number) values (?,?,?,?,?,?,?,?,?,?,?)';

                    var inputParams = [vote.voteId, vote.meetingId, vote.voteContent,
                        vote.anonymity, 'INVOTING', vote.userId, now.getTime(),
                        vote.userId, now.getTime(), 'VALID', 1];


                    var task = function (callback) {
                        connection.query(createVoteSql, inputParams, function (err, result) {
                            if (err) {
                                console.log('[INSERT ERROR] - ', err.message);
                                requestResult.code = 1;
                                requestResult.message = err.message;
                                requestResult.data = false;
                                callback(err, null);
                                res.send(200, res.json(requestResult));
                                return;
                            }
                            console.log('INSERT ID : ', result);
                            callback(null, result);
                        });
                    }

                    tasks[index] = task;
                })(votes[i], i);
            }

            async.series(tasks, function (err, result) {
                if (err) {
                    console.log(err);
                    connection.rollback(function () {
                        console.log('出现错误,回滚!');
                        //释放资源
                        connection.release();
                    });
                    result;
                }
                connection.commit(function (err) {
                    if (err) {
                        console.log('[COMMIT ERROR] - ', err.message);
                        requestResult.code = 1;
                        requestResult.message = err.message;
                        requestResult.data = false;
                        res.send(200, res.json(requestResult));
                        return;
                    }
                    console.log('成功,提交!');
                    //释放资源
                    connection.release();
                    requestResult.code = 0;
                    requestResult.message = 'success';
                    requestResult.data = true;
                    res.send(200, res.json(requestResult));
                });
            });
        });

    })
}
