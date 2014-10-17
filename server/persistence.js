var r = require('rethinkdb')
var Promise = require('bluebird')

var connection;

var onConnect = function(callback) {

    r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
        if (err) throw err;
        connection = conn;

        callback(null, conn);
    })
};

// TODO: this should init at startup, but someone could conceivably make a call before it's inited -- use a Promise
onConnect(function(err, conn) {
    connection = conn;
    connection.use('audit');
})

var CRUDService = function (t) {
    // TODO: validate object structure for all functions accepting courses as args.  Need a callback for that.

    var table = t

    return {
        "getAll" : function() {
            return new Promise(function(resolve, reject) {
                r.table(table).run(connection, function(err, cursor) {
                    if (err) reject(err);
                    cursor.toArray(function(err, result) {
                        if (err) throw err;
                        resolve(result);
                    });
                });
            });
        },

        "get" : function(id) {
            return new Promise(function(resolve, reject) {
                r.table(table).filter(r.row('id').eq(id)).run(connection, function(err, cursor) {
                    if (err) reject(err);
                    cursor.toArray(function(err, result) {
                        if (err) throw err;

                        if (result.length == 0) {
                            reject("none found for id " + id);
                        } else if (result.length > 1) {
                            reject("multiple results for id " + id);
                        } else {
                            resolve(result[0]);
                        }
                    });
                });
            });
        },

        "update" : function(course) {
            return new Promise(function(resolve, reject) {
                // what happens if there is no course with the given ID?
                r.table(table).get(course.id).replace(course).run(connection, function(err, result) {
                    if (err) reject(err);
                    console.log(result);
                    if (result.replaced == 1 || result.unchanged == 1) {
                        resolve(result);
                    } else {
                        reject(result);
                    }
                });
            });
        },

        "delete" : function(id) {
            return new Promise(function(resolve, reject) {
                // what happens if there is no course with the given ID?
                r.table(table).get(id).delete().run(connection, function(err, result) {
                    if (err) reject(err);
                    console.log(result);
                    if (result.deleted == 1) {
                        resolve(result);
                    } else {
                        reject(result);
                    }
                });
            });
        }
    }

};

exports.Course = CRUDService('courses');
exports.Student = CRUDService('students');
exports.Requirement = CRUDService('requirements');
exports.Degree = CRUDService('degrees');


exports.bootstrap = function(force) {
    // TODO: extract database config

    var model = require("./model.json");

    onConnect(function (err, connection) {

        r.dbList().run(connection,
            function(err, dblist) {
                if (err) throw err;

                console.log('result: ', dblist)

                var dbExists = dblist.indexOf('audit') != -1;

                if (dbExists && force) {
                    r.dbDrop('audit').run(connection, function() {});
                }

                if (!dbExists || force) {
                    r.dbCreate('audit').run(connection, function() {});;
                    connection.use('audit');

                    ['courses', 'students', 'requirements', 'degrees'].forEach(function(tableName) {
                        r.db('audit').tableCreate(tableName).run(connection, function (err, result) {
                            if (err) throw err;
                            console.log("create table ", tableName ,": ", JSON.stringify(result, null, 2));
                        })

                        r.table(tableName).insert(model[tableName]).run(connection, function (err, result) {
                            if (err) throw err;
                            console.log("insert bootstrap data into ", tableName, ": ", JSON.stringify(result, null, 2));
                        })
                    })

                }
            }
        )
    });
}
