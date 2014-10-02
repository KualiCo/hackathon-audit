var Promise = require('bluebird');

/**
 * Audit service takes in student transcript and degree requirements, and promises audit results
 * consisting of the met and unmet requirements
 *
 * Created by gilesp on 10/2/14.
 */
exports.report = function(studentId, degreeId) {

    var sampleAudit = {
        "studentId" : "1234567890",
        "degreeId" : "BS-CS",
            "metRequirements" : [
            {
                "id" : "CS-CAPS",
                "metby" : [ "CSE428" ]
            }
        ],
            "unmetRequirements" : [
            {
                "id" : "CS-CORE",
                "metby" : [ "CSE142" ]
            },
            {
                "id" : "VLPA",
                "metby" : []
            }
        ]
    };

    return new Promise(function(resolve, reject) {
        if (studentId != sampleAudit.studentId) {
            reject("The Audit Service is currently unavailable for this student");
        }

        if (degreeId != sampleAudit.degreeId) {
            reject("The Audit Service is currently unavailable for this degree");
        }

        resolve(sampleAudit);
    });

}