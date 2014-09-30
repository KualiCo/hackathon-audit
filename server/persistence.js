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
            return new Promise(function(resolve, reject) { resolve(model.course); });

            //// else get by id
            //r.table('course').run(connection, function(err, cursor) {
            //    if (err) throw err;
            //    cursor.toArray(callback(err, result));
            //});
        },
        "getAllSync" : function() {
            return model.course;
        },

        "put" : function(course) {
            // TODO: persist or update depending on if exists
            var exists = false;

            for (var i=0; i<model.course.length; i++) {
                var c = model.course(i);
                if (c.id == course.id) {
                    // replace
                    exists = true;
                    model.course[i] = course;
                }
            }

            if (!exists) model.course.push(course)
        },

        "delete" : function(id) {
            for (var i=0; i<model.course.length; i++) {
                var c = model.course(i);
                if (c.id == course.id) {
                    // nuke
                    model.course.splice(i, 1);
                }
            }
        }
    }

})();