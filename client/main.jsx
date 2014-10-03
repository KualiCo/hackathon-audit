/**
 * @jsx React.DOM
 */

var React = require('react');

/** @jsx React.DOM */

/* A selector for degrees */
var DegreeSelect = React.createClass({
    loadDegrees: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            success: function(data) {
                this.setState({degreeData: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    getInitialState: function() {
        return {degreeData: []};
    },
    componentDidMount: function() {
        this.loadDegrees();
    },
    render: function() {
        var degreeNodes = this.state.degreeData.map(function(degree, index) {
            return (
                <option value={degree.id}>{degree.program}</option>
            );
        });
        return (
            <div>
            <select className="form-control" name="degree">
                {degreeNodes}
            </select>
            </div>
        );
    }
});

var AuditForm = React.createClass({
    handleSubmit: function(e) {
        e.preventDefault();
        var degreeId = this.refs.degree.getDOMNode().value.trim();
        if (!degreeId) {
            return;
        }
        this.props.onCourseSubmit({degreeId: degreeId});
        this.refs.degree.getDOMNode().value = '';
        return;
    },
    render: function() {
        return (
            <form className="auditForm" role="form" onSubmit={this.handleSubmit}>
                <div className="form-group">
                    <label htmlFor="degree">Select program</label>
                    <DegreeSelect url="degrees/" />
                </div>
                <button type="submit" className="btn btn-default">Submit</button>
            </form>
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
    loadAudit: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            success: function(auditData) {
                this.setState({data: auditData});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount: function() {
        this.loadAudit();
    },
    render: function() {
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
                <AuditResults url="audit/degrees/BS-CS/students/1234567890" degreeId="BS-CS" />
            </div>
        );
    }
});

React.renderComponent(
    <AuditBox/>
    ,
    document.getElementById('auditBox')
);

