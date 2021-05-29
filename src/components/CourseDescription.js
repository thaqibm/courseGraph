// React class for "course description" class
// a menu that displays details about the course

import React from 'react';
import { Container, Row, Col } from "react-bootstrap";
import { courseSeasonDict } from "./parse-data.js";
import * as gcs from './get-course-data.js';

export default class CourseDescription extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            courseData: undefined,
            courseSeasons: [],
            coursePrereqs: []
        }
    }

    componentDidMount() {
        if (typeof this.props.course !== "undefined") {
            const [ subjectCode, catalogNumber ] = this.props.course.split(" ");
            gcs.getCourse(subjectCode, catalogNumber).then((result) => {
                console.log(result.data[0]);
                this.setState({
                    courseData: result.data[0],
                    courseSeasons: this.props.classDataDict[`${subjectCode} ${catalogNumber}`]['seasons'],
                    coursePrereqs: this.props.classDataDict[`${subjectCode} ${catalogNumber}`]['prereqs'],
                })
                console.log(this.state);
            })
        }
    }

    componentDidUpdate(prevProps) {
        if (typeof this.props.course !== "undefined" && this.props.course !== prevProps.course) {
            const [ subjectCode, catalogNumber ] = this.props.course.split(" ");
            gcs.getCourse(subjectCode, catalogNumber).then((result) => {
                this.setState({
                    courseData: result.data[0],
                    courseSeasons: this.props.classDataDict[`${subjectCode} ${catalogNumber}`]['seasons'],
                    coursePrereqs: this.props.classDataDict[`${subjectCode} ${catalogNumber}`]['prereqs'],
                })
            })
        }
    }

    makePrereqs() {
        if (this.state.coursePrereqs.length === 0) {
            return <p>This course has no prerequisites listed</p>
        }
        else {
            return <p>{this.state.courseData.requirementsDescription}</p>
        }
    }

    render() {
        if (typeof this.state.courseData === "undefined") {
            return (
                <Container lg={6}>
                    <p>No course selected</p>
                </Container>
            )
        }
        else {
            return (
                <Container>
                    <Row>
                        <Col>
                            <h3>{this.state.courseData.subjectCode} {this.state.courseData.catalogNumber} {this.state.courseSeasons.map((letter) => courseSeasonDict[letter])}</h3>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={8}>
                            <h4>{this.state.courseData.title}</h4>
                        </Col>
                        <Col lg={4}>
                            <h4>Course ID: {this.state.courseData.courseId}</h4>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <h5>Course Description</h5>
                            <p>{this.state.courseData.description}</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <h5>Course Prerequisites/Antirequisites</h5>
                            {this.makePrereqs()}
                        </Col>
                    </Row>
                </Container>
            )
        }
    }
}