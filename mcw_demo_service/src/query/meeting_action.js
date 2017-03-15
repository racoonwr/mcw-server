/**
 * Created by racoon on 2017/3/14.
 */
var mysqlConn = require('../config/maria_db_config')

export function create_meeting(req, res) {
    console.log('body = ', req.body);
    var now = new Date();

    var createMeetingSql = 'insert into g_meeting(meeting_id,title,start_date_plan,end_date_plan,meeting_require,location,status_code,' +
        'wifi_mac_add,created_by,creation_date,last_updated_by,last_update_date,record_status,version_number) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

    var inputParams = [req.params.meetingId, req.params.title, req.params.startDatePlan,
        req.params.endDatePlan, req.params.meetingRequire, req.params.location, 'CREATED',
        'WIFI_MAC_ADD', req.params.userId, now.getMilliseconds(),
        req.params.userId, now.getMilliseconds(), 'VALID', 1];

    console.log('createMeetingSql ', createMeetingSql);
    console.log('inputParams ', inputParams);

    mysqlConn.query(createMeetingSql, inputParams, function (err, result) {

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

export function get_meeting_list(req, res) {
    var query = 'select gm.meeting_id as meetingId,gm.created_by as createdBy,gm.title as title,gm.START_DATE_PLAN ' +
        'as startDatePlan,gm.END_DATE_PLAN as endDatePlan,gm.LOCATION as location,gm.STATUS_CODE as statusCode from g_meeting gm where gm.CREATED_BY ' +
        'in (select ggu2.user_id from g_group_user ggu2 ' +
        'where ggu2.group_id = (select ggu.GROUP_ID from g_group_user ggu where ggu.USER_ID = ?)) order by gm.START_DATE_PLAN desc';
    var inputParam = [req.params.userId];
    mysqlConn.query(query, inputParam, function (err, rows) {
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
    })
}


export function get_meeting_detail(req, res) {
    var query = 'select gm.* from g_meeting gm where gm.meeting_id = ?';
    var inputParam = [req.params.meetingId];
    mysqlConn.query(query, inputParam, function (err, rows) {
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
    })
}