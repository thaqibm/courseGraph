import React from 'react';
import { Container, Form, Button, DropdownButton, Dropdown, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import { courseSeasonDict, getCourseDetails } from "./parse-data.js";
import * as gcs from './get-course-data.js';
import classData from './classData.json';

// React component for dropdown menu for "subject code"
class SubjectCodeInput extends React.Component {

    constructor(props) {
        super(props);
        this.state = { subjectCodes: [] };
    }

    componentDidMount() {
        // gcs.getSubjectList((result) => {
        //     this.setState({ subjectCodes: result.data });
        // })
        gcs.getSubjectList()
            .then((result) => {
                this.setState({ 
                    subjectCodes: result.data
                        .sort((subjectA, subjectB) => subjectA.code.localeCompare(subjectB.code)), 
                });
            });
    }

    render() {
        return (
            <Form.Control
                as="select"
                size="md"
                id="subjectCode"
                onChange={this.props.updateSubjectCodeFn}
            >
                {
                    // put empty code:name pair in the dropdown menu
                    [{ code: "", name: "" }, ...this.state.subjectCodes]
                        // format options
                        .map((subject) =>
                            <option value={subject.code}>{subject.code} - {subject.name}</option>
                        )
                }
            </Form.Control>
        )
    }
}

// React component for dropdown menu for "catalog number", which is
// based on the subjectCode chosen
class CatalogNumberInput extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            subjectCode: "",
            listOfCourses: [],
        }
    }

    makeOption = (catalogNumber, title) => {
        return <option value={catalogNumber}>
            {catalogNumber} - {title}
        </option>
    }

    componentDidUpdate(prevProps) {
        if (this.props.subjectCode !== "" && this.props.subjectCode !== prevProps.subjectCode) {
            gcs.getCurrentTermData()
                .then((result) => {
                    return result.data.termCode;
                })
                .then((termCode) => {
                    return gcs.getListOfCourses(this.props.subjectCode, termCode);
                })
                .then((result) => {
                    let listOfCourses = result.data
                        .map((course) => {
                            return {
                                catalogNumber: course.catalogNumber,
                                title: course.title,
                            };
                        })
                        .sort((courseA, courseB) => courseA.catalogNumber.localeCompare(courseB.catalogNumber));
                    this.setState({
                        listOfCourses: listOfCourses
                    })
                })
        }
    }

    render() {
        return (
            <Form.Control
                as="select"
                size="md"
                id="catalogNumber"
                onChange={this.props.updateCatalogNumberFn}
            >
                {
                    this.state.listOfCourses
                        // sort by catalogNumber
                        .sort((courseA, courseB) => courseA.catalogNumber - courseB.catalogNumber)
                        // make the option objects
                        .map((course) => this.makeOption(course.catalogNumber, course.title))
                }
            </Form.Control >
        )
    }
}

// React component for dropdown menu for "course preview", which shows a
// preview of the course
class CoursePreview extends React.Component {
    render() {
        const courseDetails = getCourseDetails(this.props.subjectCode, this.props.catalogNumber);
        if (typeof courseDetails === 'undefined') {
            return (
                <Button
                    readOnly={true}
                    variant="secondary"
                >
                    Unable to provide a course preview
                </Button>
            )
        }
        return (
            <DropdownButton
                title="Click me to see a preview of the course"
                variant="info"
            >

                <Dropdown.ItemText>
                    <h5>{this.props.subjectCode} {this.props.catalogNumber}</h5>
                    <h5>{courseDetails.title}</h5>
                    <p>Course ID: {courseDetails.id}</p>
                    <h5>Description</h5>
                    <p>{courseDetails.description}</p>
                    <h5>Requirements</h5>
                    <p>{courseDetails.requirementsDescription}</p>
                </Dropdown.ItemText>
            </DropdownButton>
        )
    }
}

// React component for course seasons
class CourseSeasonsInput extends React.Component {
    render() {
        return (
            <ToggleButtonGroup
                type="checkbox"
                onChange={this.props.updateCourseSeasonsFn}
            >
                {
                    Object.keys(courseSeasonDict)
                        .map((letter) =>
                            <ToggleButton
                                inline
                                value={letter}
                                variant="light"
                            >
                                {courseSeasonDict[letter]}
                            </ToggleButton>)
                }
            </ToggleButtonGroup>
        )
    }
}

// React component for course prerequisites
class CoursePrerequisitesInput extends React.Component {
    render() {
        return (
            <Form.Control
                type="text"
                id="coursePrereqs"
                placeholder="e.g. MATH 136;MATH 138"
                onChange={this.props.updateCoursePrereqFn}
            />
        )
    }
}

// React component for "Add Course" button
class AddCourseButton extends React.Component {
    render() {
        if ((this.props.chosenSubjectCode === "") || (this.props.chosenCatalogNumber === "")) {
            return (
                <Button
                    variant="secondary"
                >
                    Add Course
                </Button>
            )
        }
        return (
            <Button
                variant="primary"
                onClick={this.props.handleSubmit}
            >
                Add Course
            </Button>
        )
    }
}

// React component for "Add Course" sidebar
class AddCourseForm extends React.Component {

    // constructor for add course form
    constructor(props) {
        super(props);
        this.state = {
            subjectCode: "",
            catalogNumber: "",
            courseSeasons: [],
            coursePrereqs: [],
        }
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    // updates state based on changes to inputs
    handleInputChange = (e) => {
        const target = e.target;
        const value = ["subjectCode", "catalogNumber"].includes(target.value)
            ? target.value
            : target.value.split(";").filter(x => x);
        this.setState({
            [target.id]: value
        });
    }

    // for the section where user adds course data manually
    handleSubmit = () => this.props.doFunctionAfterSubmitManual(this.state);

    // for the section where user adds course data using a csv
    loadClassDataFile = this.props.doFunctionAfterSubmitCSV;

    // makes preview of course
    makePreview = (subjectCode, catalogNumber) => {
        try {
            // return generateCourseNode(subjectCode, catalogNumber, courseSeasons).title;
            let courseData = classData[subjectCode][catalogNumber];
            let course = courseData[Object.keys(courseData)[0]];
            return (
                <Container fluid>
                    <h6>{subjectCode} {catalogNumber} ({course.title})</h6>
                    <p>Course ID: {course.id}</p>
                    <p>{course.description}</p>
                    <p>{course.requirementsDescription}</p>
                </Container>
            )
        } catch (err) {
            return "Invalid course data; please check that all input fields are formatted correctly";
        };
    }

    render() {
        return (
            <Container>
                <h4>Add Course</h4>
                <Form>
                    <Form.Group>
                        <Form.Label>Subject Code</Form.Label>
                        <SubjectCodeInput
                            updateSubjectCodeFn={(e) => this.setState({ subjectCode: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Catalog Number</Form.Label>
                        <CatalogNumberInput
                            subjectCode={this.state.subjectCode}
                            updateCatalogNumberFn={(e) => this.setState({ catalogNumber: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group>
                        <CoursePreview
                            subjectCode={this.state.subjectCode}
                            catalogNumber={this.state.catalogNumber}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Seasons course offered</Form.Label>
                        <CourseSeasonsInput
                            updateCourseSeasonsFn={(seasons) => this.setState({ courseSeasons: seasons })}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Course Prerequisites</Form.Label>
                        <CoursePrerequisitesInput
                            updateCoursePrereqFn={(e) => this.setState({
                                coursePrereqs: e.target.value
                                    .split(";")
                                    .map((course) => course.trim())
                            })}
                        />
                    </Form.Group>
                    <AddCourseButton
                        chosenSubjectCode={this.state.subjectCode}
                        chosenCatalogNumber={this.state.catalogNumber}
                        handleSubmit={() => this.props.doFunctionAfterSubmitManual(this.state)}
                    />
                    <Form.Group>
                        <Form.Label>Or alternatively, import class data via a CSV:</Form.Label>
                        <Form.File
                            id="classDataFile"
                            onChange={this.loadClassDataFile}
                        />
                    </Form.Group>
                </Form>
            </Container>
        );
    }
}

export default AddCourseForm;