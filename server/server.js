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

// TODO: you really wouldn't want to expose this "resource"
app.get('/bootstrap', function*(next) {
    persistence.bootstrap();
    this.body = "database reset"
});

// TODO: make handler methods gracefully handle exceptions
// TODO: make responses sensible in error cases e.g. http://www.restapitutorial.com/lessons/httpmethods.html

app.get('/courses/', function*(next) {
    var results = yield persistence.Course.getAll();
    this.body = results;
});

app.get('/courses/:id', function*(next) {
    try {
        var results = yield persistence.Course.get(this.params.id)
    } catch (err) {
        this.status = 404;
        this.body = err;
        return; // yep, early return
    }

    this.body = results;
});

// PUT to /courses/:id to update
app.put('/courses/:id', function*(next) {
    // validate that the ID matches that of the object
    if ( ! (this.params.id === this.request.body.id)) {
        this.response.status = 422;
        this.response.body = "identifier mismatch between resource location and entity";
        return;
    }

    var result = yield persistence.Course.update(this.request.body);

    if (!result) {
        this.response.status = 404;
        this.response.body = "not found: " + result;
    }

    this.body = "updated course " + this.params.id;
});

// DELETE to /courses/:id to delete
app.delete('/courses/:id', function*(next) {
    var result = yield persistence.Course.delete(this.params.id);

    if (!result) {
        this.response.status = 404;
        this.response.body = "not found: " + result;
    }

    this.body = "deleted course " + this.params.id;
});


// POST to /courses/ to create new
// ...

// EXAMPLE: call a database
function getMessage() {

}

server.listen(3000);
console.log('server listening on port 3000');
