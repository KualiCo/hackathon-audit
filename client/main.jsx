/**
 * @jsx React.DOM
 */

var React = require('react');

/** @jsx React.DOM */

/*
 * The details of a Course.
 */
var Course = React.createClass({
    render: function() {
        return (
            <div className="course">
                <h3 className="courseDetails">
                    {this.props.title} ({this.props.code}) {this.props.credits} credits
                </h3>
            </div>
        );
    }
});

var CourseSearchForm = React.createClass({
    handleSubmit: function(e) {
        e.preventDefault();
        var searchString = this.refs.searchString.getDOMNode().value.trim();
        if (!searchString) {
            return;
        }
        this.props.onCourseSubmit({searchString: searchString});
        this.refs.searchString.getDOMNode().value = '';
        return;
    },
    render: function() {
        return (
            <form className="courseSerachForm" onSubmit={this.handleSubmit}>
                <input type="text" placeholder="Course Title or Code" ref="searchString" />
                <input type="submit" value="Search" />
            </form>
        );
    }
});

/* A list of Courses */
var CourseList = React.createClass({
    render: function() {
        var courseNodes = this.props.data.map(function(course, index) {
            return (
                <li><Course title={course.name} code={course.id} credits={course.credits} key={index} /></li>
            );
        });
        return (
            <div className="courseList">
                <ul>
                {courseNodes}
                </ul>
            </div>
        );
    }
});

/* Container for a list of Courses */
var CourseBox = React.createClass({
    loadCoursesFromServer: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    handleCourseSearch: function(course) {
        var courses = this.state.data;
        courses.push(course);
        this.setState({data: courses}, function() {
            $.ajax({
                url: this.props.url,
                dataType: 'json',
                type: 'POST',
                data: course,
                success: function(data) {
                    this.setState({data: data});
                }.bind(this),
                error: function(xhr, status, err) {
                    console.error(this.props.url, status, err.toString());
                }.bind(this)
            });
        });
    },
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount: function() {
        this.loadCoursesFromServer();
    },
    render: function() {
        return (
            <div className="courseBox">
                <h1>Courses</h1>
                <CourseList data={this.state.data} />
            </div>
        );
    }
});

React.renderComponent(
    <CourseBox url="courses/" />,
    document.body
);