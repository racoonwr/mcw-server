/**
 * Created by racoon on 2017/3/16.
 */
var mysqlConn = require('../config/maria_db_config')

export function create_summary(req, res) {
    console.log('body = ', req.body);
    //开启事务
    var trans = mysqlConn.startTransaction();

    var now = new Date();

    var createSql = 'insert into g_summary_info(summary_info_id,real_start_date,real_end_date,meeting_compere,meeting_recorder,' +
        'invited_users,meeting_pics,created_by,creation_date,last_updated_by,last_update_date,record_status,version_number) values (?,?,?,?,?,?,?,?,?,?,?,?,?)';

    var inputParams = [req.params.summaryInfoId, req.params.realStartDate, req.params.realEndDate,
        req.params.meetingCompere, req.params.meetingRecorder, req.params.invitedUsers, req.params.meetingPics,
        req.params.userId, now.getTime(),
        req.params.userId, now.getTime(), 'VALID', 1];

    console.log('createSql ', createSql);
    console.log('inputParams ', inputParams);

    trans.query(createSql, inputParams, function (err, result) {
        var requestResult = {};
        if (err) {
            console.log('[INSERT ERROR] - ', err.message);
            requestResult.code = 1;
            requestResult.message = err.message;
            requestResult.data = false;
        } else {
            console.log('INSERT ID : ', result);
            var updateSql = 'UPDATE g_meeting SET status_code = ?,SUMMARY_INFO_ID = ? WHERE meeting_id = ?';
            var updateSql_Params = ['FINISHED', req.params.summaryInfoId, req.params.meetingId];
            trans.query(updateSql, updateSql_Params, function (err, result) {
                if (err) {
                    trans.rollback();
                    console.log('[UPDATE ERROR] - ', err.message);
                    requestResult.code = 1;
                    requestResult.message = err.message;
                    requestResult.data = false;
                } else {
                    trans.commit(function (err, infos) {
                        if (err) {
                            console.log('[COMMIT ERROR] - ', err.message);
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
                    });
                }
            })
        }
        //提交执行
        trans.execute();
        return res.send(200, res.json(requestResult));
    });
};

export function get_summary_detail(req, res) {
    var query = 'select gsi.summary_info_id as summaryInfoId,gsi.real_start_date as realStartDate,' +
        'gsi.real_end_date as realEndDate,gsi.meeting_compere as meetingCompere,gis.meeting_recorder as meetingRecorder,' +
        'gsi.invited_users as invitedUsers,gsi.meeting_pics as meetingPics,gsi.created_by as createdBy,gsi.creation_date as' +
        ' creationDate from g_summary_info gsi where gsi.summary_info_id = ?';
    var inputParam = [req.params.summaryInfoId];
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