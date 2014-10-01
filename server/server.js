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
    this.body = {message: "You're probably running this wrong, use 'npm start'"}
});

// TODO: you really wouldn't want to expose this "resource"
app.get('/bootstrap', function*(next) {
    persistence.bootstrap();
    this.body = "database reset"
});

// TODO: make handler methods gracefully handle exceptions
// TODO: make responses sensible in error cases e.g. http://www.restapitutorial.com/lessons/httpmethods.html
// Export a resource for each entity
[
    ['courses', 'Course'],
    ['students', 'Student'],
    ['requirements', 'Requirement'],
    ['degrees', 'Degree']
].forEach(function(resourceInfo) {

        var resourceName = resourceInfo[0];
        var resourceNameSingular = resourceInfo[1];
        var persistenceModule = resourceInfo[1];

        app.get('/' +resourceName+ '/', function*(next) {
            var results = yield persistence[resourceNameSingular].getAll();
            this.body = results;
        });

        app.get('/' +resourceName+ '/:id', function*(next) {
            try {
                var results = yield persistence[resourceNameSingular].get(this.params.id)
            } catch (err) {
                this.status = 404;
                this.body = err;
                return; // yep, early return
            }

            this.body = results;
        });

        // PUT to /<resource>/:id to update
        app.put('/' +resourceName+ '/:id', function*(next) {
            // validate that the ID matches that of the object
            if ( ! (this.params.id === this.request.body.id)) {
                this.response.status = 422;
                this.response.body = "identifier mismatch between resource location and " + resourceNameSingular;
                return;
            }

            var result = yield persistence[resourceNameSingular].update(this.request.body);

            if (!result) {
                this.response.status = 404;
                this.response.body = "not found: " + result;
            }

            this.body = "updated " + resourceNameSingular + " " + this.params.id;
        });

        // DELETE to /<resource>/:id to delete
        app.delete('/' +resourceName+ '/:id', function*(next) {
            var result = yield persistence[resourceNameSingular].delete(this.params.id);

            if (!result) {
                this.response.status = 404;
                this.response.body = "not found: " + result;
            }

            this.body = "deleted " + resourceNameSingular + " " + this.params.id;
        });


// POST to /<resource>/ to create new
// ...
    });


// EXAMPLE: call a database
function getMessage() {

}

server.listen(3000);
console.log('server listening on port 3000');
