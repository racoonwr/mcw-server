import {select_from_g_user} from './query/user_action'
import {create_meeting,get_meeting_list,get_meeting_detail} from './query/meeting_action'
import {get_vote_list,create_vote,create_votes,get_vote_detail} from './query/vote_action'


var serverIns = require('./restify_server_ins')

serverIns.get('user/all', select_from_g_user);

serverIns.get('meeting/list/:userId', get_meeting_list);
serverIns.get('meeting/detail/:meetingId', get_meeting_detail);
serverIns.post('meeting/create', create_meeting);

serverIns.get('vote/list/:meetingId',get_vote_list);
serverIns.get('vote/detail/:voteId',get_vote_detail);
serverIns.post('vote/create/single',create_vote);
serverIns.post('vote/create/list',create_votes);

serverIns.listen(8081, function () {
    console.log('%s listening at %s', serverIns.name, serverIns.url);
});