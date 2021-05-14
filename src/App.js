// Constructs the React Application

import Graph from "react-graph-vis";
import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { parse as CSVParse } from "papaparse";
// import { Papa } from 'papaparse';
// import ReactDOM from "react-dom";

import { generateCourseNode, generateCourseEdge, parseMyClassEdgeData, parseMyClassNodeData } from './parse-data.js';
import { colorLuminance } from './lighten-color.js';

// options for vis graph
const options = {
  layout: {
    hierarchical: {
      enabled: true,
      sortMethod: 'directed',
      shakeTowards: 'roots',
      direction: 'LR',
      nodeSpacing: 300,
      levelSeparation: 400,
    },
    randomSeed: '0.5650852741192154:1612598600483',
  },
  nodes: {
    font: {
      multi: 'html',
    },
  }
};

class AddCourseForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      subjectCode: "",
      catalogNumber: 0,
      courseSeasons: [],
      coursePrereqs: [],
    }
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange = (e) => {
    const target = e.target;
    const value = ["subjectCode", "catalogNumber"].includes(target.value)
      ? target.value
      : target.value.split(";").filter(x => x);
    this.setState({
      [target.id]: value
    });
  }

  handleSubmit = () => this.props.doFunctionAfterSubmitManual(this.state);

  loadClassDataFile = this.props.doFunctionAfterSubmitCSV;

  render() {
    return (
      <Form>
        <Form.Group>
          <Form.Label>Subject Code</Form.Label>
          <Form.Control
            type="text"
            id="subjectCode"
            onChange={(e) => this.setState({ subjectCode: e.target.value })}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Catalog Number</Form.Label>
          <Form.Control
            type="text"
            id="catalogNumber"
            onChange={(e) => this.setState({ catalogNumber: e.target.value })}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Seasons course offered</Form.Label>
          <Form.Control
            type="text"
            id="courseSeasons"
            onChange={(e) => this.setState({ courseSeasons: e.target.value.split(";") })}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Course Prerequisites</Form.Label>
          <Form.Control
            type="text"
            id="coursePrereqs"
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
    );
  }
}

// main application
function App() {

  // dict object containing class data
  const myClassDataDict = {};

  // highlightEdgesConnectedToNode: highlights edges connected to node (when it is clicked)
  const highlightEdgesConnectedToNode = (nodeid) => {

    // luminosity constants for how dark/light to make the edges when node clicked
    const fromLum = -0.4;
    const toLum = 0;

    setState(({ graph: { nodes, edges }, ...rest }) => {
      // get clickedNode based on nodeid (match node id with nodeid)
      let clickedNode = nodes.filter((node) => (node.id === nodeid))[0];
      console.log(clickedNode);
      // get edges connected to clickedNode, and the "other" edges not connected to clickedNode
      let fromEdges = edges.filter((edge) => (edge.from === nodeid));
      let toEdges = edges.filter((edge) => (edge.to === nodeid));
      let otherEdges = edges.filter((edge) => !((edge.to === nodeid) || (edge.from === nodeid)));
      // color outgoing and incoming arrows
      console.log(fromEdges, toEdges, otherEdges);
      return {
        graph: {
          nodes,
          edges: otherEdges
            .concat(fromEdges.map((fromEdge) => {
              return {
                ...fromEdge,
                color: colorLuminance(clickedNode.color.background, fromLum)
              }
            }))
            .concat(toEdges.map((toEdge) => {
              return {
                ...toEdge,
                color: colorLuminance(clickedNode.color.background, toLum)
              }
            })),
        },
        ...rest
      };
    });
  };

  // revert edges back to normal (ie turn them all back to light grey)
  const revertEdgesToNormal = () => {
    setState(({ graph: { nodes, edges }, ...rest }) => {
      return { graph: { nodes, edges: edges.map((edge) => { return { ...edge, color: '#bdbdbd' } }) }, ...rest };
    });
  };

  // add course when "Add Course" button clicked
  const addCourse = (state) => {
    const { subjectCode, catalogNumber, courseSeasons, coursePrereqs } = state;
    const newnode = generateCourseNode(subjectCode, catalogNumber, courseSeasons);
    const newedges = coursePrereqs.map((cp) => generateCourseEdge(subjectCode, catalogNumber, cp.split(" ")[0], cp.split(" ")[1]));
    setState(({ graph: { nodes, edges }, ...rest }) => {
      return {
        graph: {
          nodes: [
            ...nodes,
            newnode
          ],
          edges: [
            ...edges,
            ...newedges
          ],
          // edges,
        },
        ...rest
      };
    });
  };

  // load course data when CSV with class data is uploaded
  const loadCoursesFromData = (e) => {
    let filein = e.target.files[0];
    CSVParse(filein, {
      download: true,
      skipEmptyLines: true,
      complete: function (results) {
        let classDataDict = {};
        for (let i in results.data) {
          let row = results.data[i];
          if (typeof row[0] !== 'undefined') {
            classDataDict[`${row[0]} ${row[1]}`] = {
              'seasons': row[2].split(";").filter(x => x),
              'prereqs': row[3].split(";").filter(x => x),
            };
          }
        }
        setState(({ graph: { nodes, edges }, ...rest }) => {
          return {
            graph: {
              nodes: parseMyClassNodeData(classDataDict),
              edges: parseMyClassEdgeData(classDataDict),
            },
            ...rest
          };
        });
      }
    });
  }

  // setting up the graph
  const [state, setState] = useState({
    graph: {
      nodes: parseMyClassNodeData(myClassDataDict),
      edges: parseMyClassEdgeData(myClassDataDict),
    },
    events: {
      // when selecting a node, "highlight" the edges connected to it
      select: ({ nodes, edges }) => {
        highlightEdgesConnectedToNode(nodes[0]);
      },
      // when deselecting a node, "revert" the "selected" edges to "normal"
      deselectNode: ({ ...other }) => { revertEdgesToNormal() },
    }
  })
  const { graph, events } = state;

  return (
    <div id="App">
      <h1 id="heading">My Course Graph</h1>

      <Container fluid>
        <Row>
          <Col lg={8}>
            <div id="mynetwork">
              <Graph graph={graph} options={options} events={events} />
            </div>
          </Col>
          <Col lg={4}>
            <Container fluid>
              <h4>Add Course</h4>
              <AddCourseForm 
                doFunctionAfterSubmitManual={addCourse}
                doFunctionAfterSubmitCSV={loadCoursesFromData} 
              />
            </Container>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
