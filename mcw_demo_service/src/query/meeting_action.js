/**
 * Created by racoon on 2017/3/14.
 */
var db = require('../config/maria_db_config')

export function create_meeting(req, res) {
    console.log('body = ', req.body);
    var now = new Date();

    var createMeetingSql = 'insert into g_meeting(meeting_id,title,start_date_plan,end_date_plan,meeting_require,location,status_code,' +
        'wifi_mac_add,created_by,creation_date,last_updated_by,last_update_date,record_status,version_number) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

    var inputParams = [req.params.meetingId, req.params.title, req.params.startDatePlan,
        req.params.endDatePlan, req.params.meetingRequire, req.params.location, 'CREATED',
        'WIFI_MAC_ADD', req.params.userId, now.getTime(),
        req.params.userId, now.getTime(), 'VALID', 1];

    console.log('createMeetingSql ', createMeetingSql);
    console.log('inputParams ', inputParams);
    db.getConnection(function (connection) {
        connection.query(createMeetingSql, inputParams, function (err, result) {
            var requestResult = {};
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
    db.getConnection(function (connection) {
        connection.query(query, inputParam, function (err, rows) {
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
        })
    });
}


export function get_meeting_detail(req, res) {
    console.log('body = ', req.body);
    var query = 'select gm.meeting_id as meetingId,gm.title as title,gm.start_date_plan as startDatePlan,' +
        'gm.end_date_plan as endDatePlan,gm.summary_info_id as summaryInfoId,gm.meeting_require as meetingRequire,' +
        'gm.location as location,gm.status_code as statusCode,gm.created_by as createdBy,gm.creation_date as' +
        ' creationDate from g_meeting gm where gm.meeting_id = ?';
    var inputParam = [req.params.meetingId];
    db.getConnection(function (connection) {
        connection.query(query, inputParam, function (err, rows) {
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
        })
    });
}

export function start_meeting(req, res) {
    console.log('body = ', req.body);
    var updateSql = 'UPDATE g_meeting SET status_code = ?,begin_sign_time = ? WHERE meeting_id = ?';
    var updateSql_Params = ['INMEETING', new Date().getTime(), req.params.meetingId];
    db.getConnection(function (connection) {
        connection.query(updateSql, updateSql_Params, function (err, result) {
            var requestResult = {};
            if (err) {
                console.log('[UPDATE ERROR] - ', err.message);
                requestResult.code = 1;
                requestResult.message = err.message;
                requestResult.data = false;
            } else {
                console.log('----------UPDATE-------------');
                console.log('UPDATE affectedRows', result.affectedRows);
                console.log('******************************');
                requestResult.code = 0;
                requestResult.message = 'success';
                requestResult.data = true;
            }
            connection.release();
            res.send(200, res.json(requestResult));
        });
    });
}

export function end_meeting(req, res) {
    console.log('body = ', req.body);
    var updateSql = 'UPDATE g_meeting SET status_code = ?,END_MEETING_TIME = ? WHERE meeting_id = ?';
    var updateSql_Params = ['SUMMARY', new Date().getTime(), req.params.meetingId];
    db.getConnection(function (connection) {
        connection.query(updateSql, updateSql_Params, function (err, result) {
            var requestResult = {};
            if (err) {
                console.log('[UPDATE ERROR] - ', err.message);
                requestResult.code = 1;
                requestResult.message = err.message;
                requestResult.data = false;
            } else {
                console.log('----------UPDATE-------------');
                console.log('UPDATE affectedRows', result.affectedRows);
                console.log('******************************');
                requestResult.code = 0;
                requestResult.message = 'success';
                requestResult.data = true;
            }
            connection.release();
            res.send(200, res.json(requestResult));
        });
    });
}

export function meeting_sign(req, res) {
    console.log('body = ', req.body);
    var now = new Date();
    var createSql = 'insert into g_user_sign(sign_id,meeting_id,PARTICIPANT_ID,sign_date,' +
        'created_by,creation_date,last_updated_by,last_update_date,record_status,version_number) values (?,?,?,?,?,?,?,?,?)';

    var inputParams = [req.params.signId, req.params.meetingId, req.params.userId, now.getTime(),
        req.params.createdBy, now.getTime(), req.params.createdBy, now.getTime(), 'VALID', 1];

    db.getConnection(function (connection) {
        connection.query(createSql, inputParams, function (err, result) {
            var requestResult = {};
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
    });
}

