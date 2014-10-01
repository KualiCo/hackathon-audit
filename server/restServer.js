var restify = require('restify');
var persistence = require('./persistence.js');

var ip_addr = '127.0.0.1';
var port    =  '4000';

var server = restify.createServer({
    name : "service"
});

server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());

var PATH = '/courses'
server.get({path : PATH , version : '0.0.1'} , getAllCourses);
//server.get({path : PATH +'/:jobId' , version : '0.0.1'} , findJob);
//server.post({path : PATH , version: '0.0.1'} ,postNewJob);
//server.del({path : PATH +'/:jobId' , version: '0.0.1'} ,deleteJob);

server.listen(port ,ip_addr, function(){
    console.log('%s listening at %s ', server.name , server.url);
});

//yield persistence.Course.getAll()

function getAllCourses(req, res , next) {
    res.setHeader('Access-Control-Allow-Origin','*');

    res.send(200, persistence.Course.getAll().then());
}