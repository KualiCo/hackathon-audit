/**
 * @jsx React.DOM
 */

var React = require('react');

/** @jsx React.DOM */

// mocking the logged in user
var loggedInUser = { name: "John Smith", login: "jsmith123", id: "1234567890" };

var LoggedInUser = React.createClass({
    render : function() {
        return (
            <div>logged in as <strong>{loggedInUser.name}</strong> ({loggedInUser.login})</div>
        )
    }
});

React.renderComponent(
    <LoggedInUser/>
    ,
    document.getElementById('loggedInUser')
);

///* A selector for degrees */
//var DegreeSelect = React.createClass({
//    loadDegrees: function() {
//        $.ajax({
//            url: this.props.url,
//            dataType: 'json',
//            success: function(data) {
//                this.setState({degreeData: data});
//            }.bind(this),
//            error: function(xhr, status, err) {
//                console.error(this.props.url, status, err.toString());
//            }.bind(this)
//        });
//    },
//    getInitialState: function() {
//        return {degreeData: []};
//    },
//    componentDidMount: function() {
//        this.loadDegrees();
//    },
//    render: function() {
//        var degreeNodes = this.state.degreeData.map(function(degree, index) {
//            return (
//                <option value={degree.id}>{degree.type} - {degree.program}</option>
//            );
//        });
//        return (
//            <div>
//            <select className="form-control" name="degree">
//                {degreeNodes}
//            </select>
//            </div>
//        );
//    }
//});

var AuditForm = React.createClass({

    handleSubmit: function(e) {
        e.preventDefault();
        var degreeId = this.refs.degreeId.getDOMNode().value.trim();
        this.setState({ degreeData: this.state.degreeData, degreeId: degreeId });
    },

    loadDegrees: function() {
        var degreesUrl = "degrees/";
        $.ajax({
            url: degreesUrl,
            dataType: 'json',
            success: function(data) {
                this.setState({degreeData : data, degreeId : this.state.degreeId});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(degreesUrl, status, err.toString());
            }.bind(this)
        });
    },

    getInitialState: function() {
        return {degreeData: [], degreeId : ""};
    },

    componentDidMount: function() {
        this.loadDegrees();
    },

    render: function() {
        var degreeNodes = this.state.degreeData.map(function(degree, index) {
            return (
                <option value={degree.id}>{degree.type} - {degree.program}</option>
            );
        });

        var selectControl = (
            <div>
                <select className="form-control" name="degree" ref="degreeId">
                                {degreeNodes}
                </select>
            </div>
        );

        return (
            <span>
                <form className="auditForm" role="form" onSubmit={this.handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="degree">Select program (only CS works currently)</label>
                        {selectControl}
                    </div>
                    <button type="submit" className="btn btn-default">Submit</button>
                </form>
                <AuditResults studentId={loggedInUser.id} degreeId={this.state.degreeId} />
            </span>
        );
    }
});

var AuditHeader = React.createClass({
    loadDegree: function() {
        var resourceUrl = "degrees/" + this.props.degreeId;
        $.ajax({
            url: resourceUrl,
            dataType: 'json',
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(resourceUrl, status, err.toString());
            }.bind(this)
        });
    },
    getInitialState: function() {
        return {data: {}};
    },
    componentDidMount: function() {
        this.loadDegree();
    },
    render: function() {
        var degreeInfo = this.props.degreeId;
        var degree = this.state.data;

        if (degree.id) {
            degreeInfo = degree.type  + " of " + degree.domain + " in " + degree.program;
        }

        return (
            <h2>
                Requirements for {degreeInfo}
            </h2>
        );
    }
})

var AuditResults = React.createClass({
    loadAudit: function(nextProps) {
        if (nextProps.degreeId && nextProps.studentId) {
            var url = "audit/degrees/" + nextProps.degreeId + "/students/" + nextProps.studentId;

            $.ajax({
                url: url,
                dataType: 'json',
                success: function (auditData) {
                    this.setState({data: auditData});
                }.bind(this),
                error: function (xhr, status, err) {
                    console.error(url, status, err.toString());
                }.bind(this)
            });
        }
    },
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount: function() {
        this.loadAudit(this.props);
    },
    componentWillReceiveProps: function(nextProps) {
        this.loadAudit(nextProps);
    },
    render: function() {
        if (this.state.data.length == 0) return ( <div/> );

        var metNodes = "";
        if (this.state.data.metRequirements) {
            metNodes = this.state.data.metRequirements.map(function(req, index) {
                var metByNodes = req.metby.map(function(courseId, index) {
                    return (
                        <li><CourseItem courseId={courseId}/></li>
                    );
                });
                return (
                        <li> <Requirement requirementId={req.id} requiredCredits={req.requiredCredits} />
                            &nbsp;met by:
                            <ul>
                            {metByNodes}
                            </ul>
                        </li>
                );
            });
        }

        var unmetNodes = "";
        if (this.state.data.unmetRequirements) {
            unmetNodes = this.state.data.unmetRequirements.map(function(req, index) {

                var metByText = "";
                if (req.metby && req.metby.length > 0) {
                    metByText = ", partially met by:";
                }
                var metByNodes = req.metby.map(function(courseId, index) {
                    return (
                        <li><CourseItem courseId={courseId}/></li>
                    );
                });
                return (
                    <li> <Requirement requirementId={req.id} requiredCredits={req.requiredCredits} />
                        {metByText}
                        <ul>
                            {metByNodes}
                        </ul>
                    </li>
                );
            });
        }

        return (
            <div>
                <h1 className="page-header">Results</h1>
                <AuditHeader degreeId={this.props.degreeId} />
                <h3>Met</h3>
                <ul>
                {metNodes}
                </ul>
                <h3>Unmet</h3>
                <ul>
                {unmetNodes}
                </ul>
            </div>
        );
    }
});

var Requirement = React.createClass({
    loadRequirementDetails: function() {
        var url = "requirements/" + this.props.requirementId;
        $.ajax({
            url: url,
            dataType: 'json',
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(url, status, err.toString());
            }.bind(this)
        });
    },
    getInitialState: function() {
        return {data: undefined};
    },
    componentDidMount: function() {
        this.loadRequirementDetails();
    },
    render: function() {
        var requirementId = this.props.requirementId;
        var requiredCredits = this.props.requiredCredits;

        if (this.state.data) {
            var requirement = this.state.data;
            var requirementUrl = "requirements/" + requirement.id;
            return (
                <span>
                    <a href={requirementUrl}>{requirement.id}</a>:&nbsp;
                    <strong>{requirement.name}</strong>, requires {requiredCredits} credits
                </span>
            );
        };

        // default
        return (
            <span>{this.props.requirementId}: requires {this.props.requiredCredits} credits</span>
        );
    }
});

var CourseItem = React.createClass({
    loadCourseDetails: function() {
        var url = "courses/" + this.props.courseId;
        $.ajax({
            url: url,
            dataType: 'json',
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(url, status, err.toString());
            }.bind(this)
        });
    },
    getInitialState: function() {
        return {data: undefined};
    },
    componentDidMount: function() {
        this.loadCourseDetails();
    },
    render: function() {

        if (this.state.data) {
            var course = this.state.data;
            var courseUrl = "courses/" + course.id;
            return (
                <span><a href={courseUrl}>{course.id}</a>: {course.name}, {course.credits} credits</span>
            );
        };

        // default
        return (
            <span>{this.props.courseId}</span>
        );
    }
});

var AuditBox = React.createClass({
    render: function() {
        return (
            <div>
                <AuditForm />
            </div>
        );
    }
});

React.renderComponent(
    <AuditBox/>
    ,
    document.getElementById('auditBox')
);

