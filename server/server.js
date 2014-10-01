// --- Require Dependencies ----------------------------------------------------

var fs = require('fs');
var koa = require('koa');
var router = require('koa-router');
var serve = require('koa-static');
var body = require('koa-body');
var persistence = require('./persistence.js');

// --- Koa Setup ---------------------------------------------------------------

var app = koa();

app.use(serve('./client'));
app.use(body());
app.use(router(app));

// --- Create Servers ----------------------------------------------------------

var server = require('http').Server(app.callback());

app.get('/', function*(next) {
    this.body = {message: "Hello World -- your degree audit dreams are coming true"}
});

app.get('/courses/', function*(next) {
    var results = yield persistence.Course.getAll();
    this.body = results;
});

app.get('/courses/:id', function*(next) {
    var results = yield persistence.Course.get(this.params.id)
    this.body = results;
});

// PUT to /courses/:id to update
app.put('/courses/:id', function*(next) {
    console.log(this.request.body);
    // XXX: broken atm, need to figure out how to get the body cleanly
    // this is what comes back:
    // { '{ "id": "ENG101", "name": "English Composition II", "credits": "5" }': '' }
    persistence.Course.put(this.request.body)
});

// POST to /courses/ to create new
// ...

// EXAMPLE: call a database
function getMessage() {

}


server.listen(3000);
console.log('server listening on port 3000');
