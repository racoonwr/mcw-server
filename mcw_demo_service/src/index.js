import {select_from_g_user} from './query/test'
var serverIns = require('./restify_server_ins')

serverIns.get('user/all', function respond(req, res, next){
    select_from_g_user(req, res, next)
});

serverIns.listen(8081, function () {
    console.log('%s listening at %s', serverIns.name, serverIns.url);
});