// --- Require Dependencies ----------------------------------------------------

var fs = require('fs');
var koa = require('koa');
var router = require('koa-router');
var serve = require('koa-static');
var body = require('koa-body');
var restify = require('restify');

// --- Koa Setup ---------------------------------------------------------------

var app = koa();

app.use(serve('./client'));
app.use(body());
app.use(router(app));

// --- Create Servers ----------------------------------------------------------

var server = require('http').Server(app.callback());

//app.get('/service', function*() {
//    this.body = {message: "Hello World -- your degree audit dreams are coming true"}
//});

app.get('/service/course', function*() {
    var results = yield persistence.Course.getAll();

    this.body = results;
});


// EXAMPLE: call a database
function getMessage() {

}


server.listen(3000);
console.log('server listening on port 3000');
