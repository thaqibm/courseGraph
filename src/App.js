// Constructs the React Application

import { ExportToCsv } from "export-to-csv";
import React from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import Graph from "react-graph-vis";
import { parse as CSVParse } from "papaparse";

import classData from './classData.json';
import { generateCourseNode, generateCourseEdge, parseMyClassEdgeData, parseMyClassNodeData } from './parse-data.js';
import { colorLuminance } from './lighten-color.js';

// options for vis graph
// const options = {
//   layout: {
//     hierarchical: {
//       enabled: true,
//       sortMethod: 'directed',
//       shakeTowards: 'roots',
//       direction: 'LR',
//       nodeSpacing: 300,
//       levelSeparation: 400,
//     },
//     randomSeed: '0.5650852741192154:1612598600483',
//   },
//   nodes: {
//     font: {
//       multi: 'html',
//     },
//   }
// };

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
            <Form.Control
              type="text"
              id="subjectCode"
              placeholder="e.g. MATH"
              onChange={(e) => this.setState({ subjectCode: e.target.value })}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Catalog Number</Form.Label>
            <Form.Control
              type="text"
              id="catalogNumber"
              placeholder="e.g. 239"
              onChange={(e) => this.setState({ catalogNumber: e.target.value })}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Course preview</Form.Label>
            <br />
            {this.makePreview(this.state.subjectCode, this.state.catalogNumber)}
          </Form.Group>
          <Form.Group>
            <Form.Label>Seasons course offered</Form.Label>
            <Form.Control
              type="text"
              id="courseSeasons"
              placeholder="e.g. F;W;S"
              onChange={(e) => this.setState({ courseSeasons: e.target.value.split(";") })}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Course Prerequisites</Form.Label>
            <Form.Control
              type="text"
              id="coursePrereqs"
              placeholder="e.g. MATH 136;MATH 138"
              onChange={(e) => this.setState({ coursePrereqs: e.target.value.split(";") })}
            />
          </Form.Group>
          <Button variant="primary" onClick={this.handleSubmit}>Add Course</Button>
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

// React Component to export class data as CSV
class ExportClassData extends React.Component {

  doFunction = this.props.doFunction;

  render() {
    return (
      <Container>
        <Button variant="primary" onClick={this.doFunction}>
          Export Class Data as CSV
        </Button>
      </Container>
    )
  }
}

// React Component for the graph (ie "My Network")
class App extends React.Component {

  // initial dict for class data
  myClassDataDict = {
    // test data
    // "MATH 135": { "prereqs": [], "seasons": ["F", "W", "S"] },
    // "MATH 136": { "prereqs": ["MATH 135"], "seasons": ["F", "W", "S"] },
  };

  constructor(props) {
    super(props);
    this.state = {
      classDataDict: this.myClassDataDict,
      graph: {
        nodes: parseMyClassNodeData(this.myClassDataDict),
        edges: parseMyClassEdgeData(this.myClassDataDict),
      },
      events: {
        // when selecting a node, "highlight" the edges connected to it
        select: ({ nodes, edges }) => {
          this.highlightEdgesConnectedToNode(nodes[0]);
        },
        // when deselecting a node, "revert" the "selected" edges to "normal"
        deselectNode: ({ ...other }) => {
          this.revertEdgesToNormal();
        },
        // stabilized: ({ iterations }) => {
        //   console.log(iterations);
        //   this.setState(({options, ...rest}) => {
        //     return {
        //       options,
        //       ...rest
        //     }
        //   })
        // }
      },
      options: {
        layout: {
          hierarchical: {
            enabled: true,
            sortMethod: 'directed',
            shakeTowards: 'roots',
            direction: 'LR',
            nodeSpacing: 150,
            levelSeparation: 280,
          },
        },
        nodes: {
          font: {
            multi: 'html',
          },
        },
        // physics: false,
        physics: {
          enabled: true,
          minVelocity: 0.05,
          maxVelocity: 30,
          hierarchicalRepulsion: {
            centralGravity: 1,
          },
        },
      },
    };
  };

  // highlightEdgesConnectedToNode: highlights edges connected to node (when it is clicked)
  highlightEdgesConnectedToNode = (nodeid) => {

    // we do nothing for now, since I do not know how to make the simulation
    // "stop" when I click the node

    // // luminosity constants for how dark/light to make the edges when node clicked
    // const fromLum = -0.4;
    // const toLum = 0;

    // this.setState(({ options, graph: { nodes, edges }, ...rest }) => {
    //   // get clickedNode based on nodeid (match node id with nodeid)
    //   let clickedNode = nodes.filter((node) => (node.id === nodeid))[0];
    //   // get edges connected to clickedNode, and the "other" edges not connected to clickedNode
    //   let fromEdges = edges.filter((edge) => (edge.from === nodeid));
    //   let toEdges = edges.filter((edge) => (edge.to === nodeid));
    //   let otherEdges = edges.filter((edge) => !((edge.to === nodeid) || (edge.from === nodeid)));
    //   // color outgoing and incoming arrows
    //   return {
    //     options,
    //     graph: {
    //       nodes,
    //       edges: otherEdges
    //         .concat(fromEdges.map((fromEdge) => {
    //           return {
    //             ...fromEdge,
    //             width: 2,
    //             color: colorLuminance(clickedNode.color.background, fromLum),
    //           }
    //         }))
    //         .concat(toEdges.map((toEdge) => {
    //           return {
    //             ...toEdge,
    //             width: 2,
    //             color: colorLuminance(clickedNode.color.background, toLum),
    //           }
    //         })),
    //     },
    //     ...rest
    //   };
    // });
  };

  // revert edges back to normal (ie turn them all back to light grey)
  revertEdgesToNormal = () => {

    // we do nothing for now, since I do not know how to make the simulation
    // "stop" when I click the node

    // this.setState(({ graph: { nodes, edges }, ...rest }) => {
    //   return {
    //     graph:
    //     {
    //       nodes,
    //       edges: edges.map((edge) => {
    //         return {
    //           ...edge, 
    //           color: '#bdbdbd',
    //           width: 1,
    //         }
    //       })
    //     },
    //     ...rest
    //   };
    // });
  };

  // add course when "Add Course" button clicked
  addCourse = (state) => {
    const { subjectCode, catalogNumber, courseSeasons, coursePrereqs } = state;
    const newnode = generateCourseNode(subjectCode, catalogNumber, courseSeasons);
    const newedges = coursePrereqs.map((cp) => generateCourseEdge(subjectCode, catalogNumber, cp.split(" ")[0], cp.split(" ")[1]));
    const newcourse = { [subjectCode + " " + catalogNumber]: { "seasons": courseSeasons, "prereqs": coursePrereqs } };
    console.log(newcourse);
    this.setState(({ classDataDict, graph: { nodes, edges }, ...rest }) => {
      return {
        classDataDict: {
          ...classDataDict,
          ...newcourse
        },
        graph: {
          nodes: [
            ...nodes,
            newnode
          ],
          edges: [
            ...edges,
            ...newedges
          ],
        },
        ...rest
      };
    });
  };

  // load course data when CSV with class data is uploaded
  loadCoursesFromData = (e) => {
    let filein = e.target.files[0];
    CSVParse(filein, {
      download: true,
      skipEmptyLines: true,
      complete: (results) => {
        this.myClassDataDict = {};
        for (let i in results.data) {
          let row = results.data[i];
          if (typeof row[0] !== 'undefined') {
            this.myClassDataDict[`${row[0]} ${row[1]}`] = {
              'seasons': row[2].split(";").filter(x => x),
              'prereqs': row[3].split(";").filter(x => x),
            };
          }
        }
        console.log(this.myClassDataDict);
        this.setState(({ classDataDict, graph: { nodes, edges }, ...rest }) => {
          return {
            classDataDict: this.myClassDataDict,
            graph: {
              nodes: parseMyClassNodeData(this.myClassDataDict),
              edges: parseMyClassEdgeData(this.myClassDataDict),
            },
            ...rest
          }
        });
      },
    });
  }

  exportClassDataAsCSV = () => {
    console.log(this.state.classDataDict);
    const data = Object.keys(this.state.classDataDict)
      .map((cid) => [
        cid.split(" ")[0],
        cid.split(" ")[1],
        this.state.classDataDict[cid]["seasons"].join(";"),
        this.state.classDataDict[cid]["prereqs"].join(";")
      ]);

    console.log(data);
    const csvExporter = new ExportToCsv({
      fieldSeparator: ',',
      filename: 'classData',
      title: 'Class Data',
    });
    csvExporter.generateCsv(data);
  }

  render() {
    return (
      <Container id="App">
        <h1 id="heading">My Course Graph</h1>
        <Container fluid>
          <Row>
            <Col lg={8}>
              <Container id="mynetwork">
                <Graph graph={this.state.graph} options={this.state.options} events={this.state.events} />
              </Container>
              {/* <MyNetwork /> */}
            </Col>
            <Col lg={4}>
              <AddCourseForm
                doFunctionAfterSubmitManual={this.addCourse}
                doFunctionAfterSubmitCSV={this.loadCoursesFromData}
              />
              <ExportClassData
                doFunction={this.exportClassDataAsCSV}
              />
            </Col>
          </Row>
        </Container>
      </Container>
    );
  }
}

export default App;
