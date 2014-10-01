var r = require('rethinkdb')
var Promise = require('bluebird')

var onConnect = function(callback) {

    r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
        if (err) throw err;
        connection = conn;

        callback(null, connection);
    })
};

var model = require("./model.json");

exports.Course = (function () {

    return {
        "getAll" : function() {
            return new Promise(function(resolve, reject) { resolve(model.courses); });

            //// else get by id
            //r.table('course').run(connection, function(err, cursor) {
            //    if (err) throw err;
            //    cursor.toArray(callback(err, result));
            //});
        },

        "getAllSync" : function() {
            return model.courses;
        },

        "get" : function(id) {
            return new Promise(function(resolve, reject) {
                var course;

                for (var i=0; i<model.courses.length; i++) {
                    var c = model.courses[i];
                    if (c.id === id) {
                        course = c;
                    }
                }

                resolve(course);
            });

            //// else get by id
            //r.table('course').run(connection, function(err, cursor) {
            //    if (err) throw err;
            //    cursor.toArray(callback(err, result));
            //});
        },

        "put" : function(course) {
            // TODO: persist or update depending on if exists
            var exists = false;

            for (var i=0; i<model.courses.length; i++) {
                var c = model.courses[i];
                if (c.id === course.id) {
                    // replace
                    exists = true;
                    model.courses[i] = course;
                }
            }

            if (!exists) model.courses.push(course)
        },

        "delete" : function(id) {
            for (var i=0; i<model.courses.length; i++) {
                var c = model.courses[i];
                if (c.id === course.id) {
                    // nuke
                    model.courses.splice(i, 1);
                }
            }
        }
    }

})();