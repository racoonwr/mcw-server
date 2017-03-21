import {select_from_g_user} from './query/user_action'
import {create_meeting_v2,get_meeting_list,get_meeting_detail,start_meeting,end_meeting,meeting_sign} from './query/meeting_action'
import {get_vote_list,create_vote,create_votes,get_vote_detail,create_vote_record} from './query/vote_action'
import {create_summary,get_summary_detail} from './query/summary_action'


var serverIns = require('./restify_server_ins')

serverIns.get('user/all', select_from_g_user);

serverIns.get('meeting/list/:userId/:pageNo/:pageSize', get_meeting_list);
serverIns.get('meeting/detail/:meetingId', get_meeting_detail);
serverIns.post('meeting/create', create_meeting_v2);
serverIns.post('meeting/start',start_meeting);
serverIns.post('meeting/end',end_meeting);
serverIns.post('meeting/sign',meeting_sign);

serverIns.get('vote/list/:meetingId',get_vote_list);
serverIns.get('vote/detail/:voteId/:userId',get_vote_detail);
serverIns.post('vote/create/single',create_vote);
serverIns.post('vote/create/list',create_votes);
serverIns.post('vote/record/create',create_vote_record);

serverIns.get('summary/detail/:summaryInfoId', get_summary_detail);
serverIns.post('summary/create', create_summary);


serverIns.listen(8081, function () {
    console.log('%s listening at %s', serverIns.name, serverIns.url);
});