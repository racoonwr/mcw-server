import {select_from_g_user} from './query/test'
var serverIns = require('./restify_server_ins')

serverIns.get('queryListVideo/:vid/:count/:type/:userId', function respond(req, res, next){
    select_from_g_user(req, res, next)
});

serverIns.listen(8080, function () {
    console.log('%s listening at %s', serverIns.name, serverIns.url);
});