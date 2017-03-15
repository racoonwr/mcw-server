/**
 * Created by racoon on 2017/3/12.
 */
var restify = require('restify');
var instance = restify.createServer({
    name: 'mcw_demo_service',
    version: '1.0.0'
});

instance.use(restify.bodyParser());

module.exports = instance;