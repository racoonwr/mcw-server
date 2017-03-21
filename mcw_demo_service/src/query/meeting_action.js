/**
 * Created by racoon on 2017/3/14.
 */
var db = require('../config/maria_db_config')
var async = require('async');
import {select_data, update_data, insert_data} from '../util/db_util'

export function create_meeting(req, res) {
    console.log('body = ', req.body);
    var now = new Date();
    var createMeetingSql = 'insert into g_meeting(meeting_id,title,start_date_plan,end_date_plan,meeting_require,location,status_code,' +
        'wifi_mac_add,created_by,creation_date,last_updated_by,last_update_date,record_status,version_number) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
    var inputParams = [req.params.meetingId, req.params.title, req.params.startDatePlan,
        req.params.endDatePlan, req.params.meetingRequire, req.params.location, 'CREATED',
        'WIFI_MAC_ADD', req.params.userId, now.getTime(),
        req.params.userId, now.getTime(), 'VALID', 1];
    insert_data(createMeetingSql, inputParams, function (err, result) {
        res.send(200, res.json(result));
    });
};

export function create_meeting_v2(req, res) {
    console.log('body = ', req.body);
    //开启事务
    db.getConnection(function (connection) {
        connection.beginTransaction(function (err) {
            if (err) {
                console.log(err);
                return;
            }
            var requestResult = {};
            var now = new Date();
            var tasks = [];

            var createMeeting = function (callback) {
                var createSql = 'insert into g_meeting(meeting_id,title,start_date_plan,end_date_plan,meeting_require,location,status_code,' +
                    'wifi_mac_add,created_by,creation_date,last_updated_by,last_update_date,record_status,version_number) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
                var inputParams = [req.params.meetingId, req.params.title, req.params.startDatePlan,
                    req.params.endDatePlan, req.params.meetingRequire, req.params.location, 'CREATED',
                    'WIFI_MAC_ADD', req.params.userId, now.getTime(),
                    req.params.userId, now.getTime(), 'VALID', 1];
                console.log('createMeetingSql ', createSql);
                console.log('inputParams ', inputParams);
                connection.query(createSql, inputParams, function (err, result) {
                    if (err) {
                        console.log('[INSERT ERROR] - ', err.message);
                        requestResult.code = 1;
                        requestResult.message = err.message;
                        requestResult.data = false;
                        callback(err, null);
                        return;
                    }
                    console.log('INSERT ID : ', result);
                    callback(null, result);
                });
            }

            var participants = req.params.participants;

            for (var i = 0; i < participants.length; i++) {
                (function (participant, index) {

                    var createSql = 'INSERT INTO g_user_sign (sign_id,meeting_id' +
                        ',PARTICIPANT_ID' +
                        ',sign_date' +
                        ',created_by' +
                        ',creation_date' +
                        ',last_updated_by' +
                        ',last_update_date' +
                        ',record_status' +
                        ',version_number' +
                        ') values(' +
                        'UUID(),?,?,null,?,?,?,?,?,?)';

                    var inputParams = [req.params.meetingId, participant, now.getTime(),
                        req.params.userId, now.getTime(), req.params.userId, now.getTime(), 'VALID', 1];


                    var createSignEmptyInfo = function (callback) {
                        connection.query(createSql, inputParams, function (err, result) {
                            if (err) {
                                console.log('[INSERT ERROR] - ', err.message);
                                requestResult.code = 1;
                                requestResult.message = err.message;
                                requestResult.data = false;
                                callback(err, null);
                                return;
                            }
                            console.log('INSERT ID : ', result);
                            callback(null, result);
                        });
                    }
                    tasks[index] = createSignEmptyInfo;
                })(participants[i], i);
            }

            tasks[tasks.length] = createMeeting;

            async.series(tasks, function (err, result) {
                if (err) {
                    console.log(err);
                    connection.rollback(function () {
                        console.log('出现错误,回滚!');
                        //释放资源
                        connection.release();
                    });
                    res.send(200, res.json(requestResult));
                    return;
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
    });
};

export function get_meeting_list(req, res) {
    console.log('body = ', req.body);

    var query = 'select gm.meeting_id as meetingId,gm.created_by as createdBy,gm.title as title,gm.START_DATE_PLAN ' +
        'as startDatePlan,gm.END_DATE_PLAN as endDatePlan,gm.LOCATION as location,gm.STATUS_CODE as statusCode from ' +
        'g_meeting gm where gm.CREATED_BY in (select ggu2.user_id from g_group_user ggu2 ' +
        'where ggu2.group_id = (select ggu.GROUP_ID from g_group_user ggu where ggu.USER_ID = ?)) order by gm.START_DATE_PLAN desc limit '
        + req.params.pageNo + ',' + req.params.pageSize;

    var inputParam = [req.params.userId];

    select_data(query, inputParam, function (err, result) {
        res.send(200, res.json(result));
    })
};


export function get_meeting_detail(req, res) {
    console.log('body = ', req.body);
    var query = 'select gm.meeting_id as meetingId,gm.title as title,gm.start_date_plan as startDatePlan,' +
        'gm.end_date_plan as endDatePlan,gm.summary_info_id as summaryInfoId,gm.meeting_require as meetingRequire,' +
        'gm.location as location,gm.status_code as statusCode,gm.created_by as createdBy,gm.creation_date as' +
        ' creationDate from g_meeting gm where gm.meeting_id = ?';

    var querySignData = 'SELECT ' +
        'gus.SIGN_ID AS signId,' +
        'gus.PARTICIPANT_ID AS participantId,' +
        'gus.SIGN_DATE AS signDate,' +
        'gu.photo_url AS photoUrl,' +
        'gu.NAME AS name,' +
        'gu.phone AS phone ' +
        'FROM ' +
        'g_user_sign gus ' +
        'LEFT JOIN g_user gu ON gus.PARTICIPANT_ID = gu.user_id ' +
        'where gus.MEETING_ID = ?';

    var inputParam = [req.params.meetingId];

    var reqResult = {};
    reqResult.code = 0;
    reqResult.message = 'success';
    reqResult.data = {}
    select_data(query, inputParam, function (err, baseInfoResult) {
        if (err) {
            res.send(200, res.json(baseInfoResult));
        } else {
            reqResult.data.baseInfo = baseInfoResult.data[0];
            select_data(querySignData, inputParam, function (err, signInfoResult) {
                if (err) {
                    res.send(200, res.json(signInfoResult));
                } else {
                    reqResult.data.participants = signInfoResult.data;
                    res.send(200, res.json(reqResult));
                }
            })
        }
    })
};

export function start_meeting(req, res) {
    console.log('body = ', req.body);
    var updateSql = 'UPDATE g_meeting SET status_code = ?,begin_sign_time = ? WHERE meeting_id = ?';
    var updateSql_Params = ['INMEETING', new Date().getTime(), req.params.meetingId];
    update_data(updateSql, updateSql_Params, function (err, result) {
        res.send(200, res.json(result));
    })
};

export function end_meeting(req, res) {
    console.log('body = ', req.body);
    var updateSql = 'UPDATE g_meeting SET status_code = ?,END_MEETING_TIME = ? WHERE meeting_id = ?';
    var updateSql_Params = ['SUMMARY', new Date().getTime(), req.params.meetingId];
    update_data(updateSql, updateSql_Params, function (err, result) {
        res.send(200, res.json(result));
    });
};

export function meeting_sign(req, res) {
    console.log('body = ', req.body);
    var now = new Date();
    var updateSql = 'UPDATE g_user_sign SET sign_date = ? WHERE sign_id = ?';
    var inputParams = [now.getTime(), req.params.signId];

    update_data(updateSql, inputParams, function (err, result) {
        res.send(200, res.json(result));
    });
};

