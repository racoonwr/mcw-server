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
                connection.release();
                res.send(200, res.json(requestResult));
            });
    })
};

export function get_vote_detail(req, res) {
    console.log('body = ', req.body);
    var querySql = 'select gv.VOTE_ID as voteId,gv.VOTE_CONTENT as voteContent,gv.ANONYMITY as anonymity,' +
        'gv.STATUS_CODE as statusCode ,gv.count_agree as countAgree,gv.count_reject as countReject,' +
        'gv.count_giveup as countGiveup,gv.count_keep as countKeep,' +
        '(select gvr.result_code from g_vote_record gvr where gvr.vote_id = ? and gvr.created_by = ? ) as resultCode' +
        ' from g_vote gv where gv.vote_id = ?';
    var inputParams = [req.params.voteId, req.params.userId, req.params.voteId];
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
                connection.release();
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
            connection.release();
            res.send(200, res.json(requestResult));
        });
    })
};

export function create_votes(req, res) {
    console.log('body = ', req.body);
    var votes = req.params.list;
    var meetingId = req.params.meetingId;
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

                    var inputParams = [vote.voteId, meetingId, vote.voteContent,
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


export function create_vote_record(req, res) {
    // AGREE/REJECT/GIVEUP/KEEP
    console.log('body = ', req.body);
    var resultCode = req.params.resultCode;
    var updateField = 'COUNT_' + resultCode;
    // switch (resultCode){
    //     case 'AGREE':
    //         updateField = 'count_agree';
    //         break;
    //     case 'REJECT':
    //         updateField = 'count_reject';
    //         break;
    //     case 'GIVEUP':
    //         updateField = 'count_giveup';
    //         break;
    //     case 'KEEP':
    //         updateField = 'count_keep';
    //         break
    //     default:
    //         break;
    // }
    //开启事务
    db.getConnection(function (connection) {
        connection.beginTransaction(function (err) {
            if (err) {
                console.log(err);
                return;
            }
            var requestResult = {};
            var createRecord = function (callback) {

                var now = new Date();
                var createSql = 'insert into g_vote_record(record_id,vote_id,result_code,' +
                    'created_by,creation_date,last_updated_by,last_update_date,' +
                    'record_status,version_number) values (?,?,?,?,?,?,?,?,?)';

                var inputParams = [req.params.recordId, req.params.voteId, resultCode,
                    req.params.userId, now.getTime(), req.params.userId, now.getTime(), 'VALID', 1];

                console.log('createSql ', createSql);
                console.log('inputParams ', inputParams);

                connection.query(createSql, inputParams, function (err, result) {
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

            var updateVoteInfo = function (callback) {
                var updateSql = 'UPDATE g_vote SET ' + updateField + ' = ' + updateField + ' + 1 WHERE vote_id = ?';
                var updateSql_Params = [req.params.voteId];
                connection.query(updateSql, updateSql_Params, function (err, result) {
                    if (err) {
                        console.log('[UPDATE ERROR] - ', err.message);
                        requestResult.code = 1;
                        requestResult.message = err.message;
                        requestResult.data = false;
                        callback(err, null)
                        res.send(200, res.json(requestResult));
                    }
                    console.log('----------UPDATE-------------');
                    console.log('UPDATE affectedRows', result.affectedRows);
                    console.log('******************************');
                    callback(null, result);
                });
            }

            async.series([createRecord, updateVoteInfo], function (err, result) {
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
        })
    })
};

