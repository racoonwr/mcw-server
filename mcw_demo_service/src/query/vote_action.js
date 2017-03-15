/**
 * Created by racoon on 2017/3/14.
 */
var mysqlConn = require('../config/maria_db_config')

export function get_vote_list(req, res, next) {
    var querySql = 'select gv.VOTE_ID as voteId,gv.VOTE_CONTENT as voteContent,gv.ANONYMITY as anonymity,gv.STATUS_CODE as statusCode from g_vote gv where gv.MEETING_ID = ?';
    var inputParams = [req.params.meetingId];
    mysqlConn.query(querySql, inputParams,
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
            res.send(200, res.json(requestResult));
        });
    return next;
};

export function get_vote_detail(req, res, next) {
    var querySql = 'select gv.VOTE_ID as voteId,gv.VOTE_CONTENT as voteContent,gv.ANONYMITY as anonymity,gv.STATUS_CODE as statusCode from g_vote gv where gv.vote_id = ?';
    var inputParams = [req.params.voteId];
    mysqlConn.query(querySql, inputParams,
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
            res.send(200, res.json(requestResult));
        });
    return next;
};

export function create_vote(req, res) {
    console.log('body = ', req.body);
    var now = new Date();

    var createVoteSql = 'insert into g_vote(vote_id,meeting_id,vote_content,anonymity' +
        ',status_code,created_by,creation_date,last_updated_by,last_update_date,' +
        'record_status,version_number) values (?,?,?,?,?,?,?,?,?,?,?)';

    var inputParams = [req.params.voteId, req.params.meetingId, req.params.voteContent,
        req.params.anonymity, 'INVOTING', req.params.userId, now.getMilliseconds(),
        req.params.userId, now.getMilliseconds(), 'VALID', 1];

    console.log('createVoteSql ', createVoteSql);
    console.log('inputParams ', inputParams);
    var requestResult = {};
    mysqlConn.query(createVoteSql, inputParams, function (err, result) {
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
        return res.send(200, res.json(requestResult));
    });
};

export function create_votes(req, res) {
    console.log('body = ', req.body);
    var now = new Date();
    var votes = req.params.votelist;
    //开启事务
    var trans = mysqlConn.startTransaction();

    var requestResult = {};

    for (var i = 0; i < votes.length; i++) {
        (function (vote, index, leng) {

            var createVoteSql = 'insert into g_vote(vote_id,meeting_id,vote_content,anonymity' +
                ',status_code,created_by,creation_date,last_updated_by,last_update_date,' +
                'record_status,version_number) values (?,?,?,?,?,?,?,?,?,?,?)';

            var inputParams = [vote.voteId, vote.meetingId, vote.voteContent,
                vote.anonymity, 'INVOTING', vote.userId, now.getMilliseconds(),
                vote.userId, now.getMilliseconds(), 'VALID', 1];

            //插入明细档
            trans.query(createVoteSql, inputParams, function (err, info) {
                if (err) {
                    //callback(err, null);
                    trans.rollback();
                    console.log('[INSERT ERROR] - ', err.message);
                    requestResult.code = 1;
                    requestResult.message = err.message;
                    requestResult.data = false;
                } else {
                    //如果是最后一次就提交事务断开连接
                    if (index == leng - 1) {
                        trans.commit(function (err, infos) {
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
                        });
                    }
                }
            });
        })(votes[i], i, votes.length);
    }
    //提交执行
    trans.execute();
    return res.send(200, res.json(requestResult));
};
