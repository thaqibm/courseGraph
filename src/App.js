// Constructs the React Application

import Graph from "react-graph-vis";
import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
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

  handleSubmit = () => this.props.doFunctionAfterSubmit(this.state);

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
      </Form>
    );
  }
}

// main application
function App() {
  // const createNode = (x, y) => {
  //   const color = randomColor();
  //   setState(({ graph: { nodes, edges }, counter, ...rest }) => {
  //     const id = counter + 1;
  //     const from = Math.floor(Math.random() * (counter - 1)) + 1;
  //     return {
  //       graph: {
  //         nodes: [
  //           ...nodes,
  //           { id, label: `Node ${id}`, color, x, y }
  //         ],
  //         edges: [
  //           ...edges,
  //           { from, to: id }
  //         ]
  //       },
  //       counter: id,
  //       ...rest
  //     }
  //   });
  // }

  // dict object containing class data
  // (for now, its "test data")
  const myClassDataDict = {
    // "MATH 135": {
    //   "prereqs": [],
    //   "seasons": ["F", "W", "S"],
    // },
    // "MATH 136": {
    //   "prereqs": ["MATH 135"],
    //   "seasons": ["F", "W", "S"],
    // },
    // "MATH 237": {
    //   "prereqs": ["MATH 136"],
    //   "seasons": ["F", "W", "S"],
    // },
  };

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
    console.log(newnode, newedges);
    setState(({ graph: { nodes, edges }, counter, ...rest }) => {
      console.log(nodes);
      console.log(edges);
      return {
        graph: {
          nodes: [
            ...nodes, 
            newnode
            // { id: "HELLLO", label: "woo"}
          ],
          edges: [
            ...edges, 
            ...newedges
          ],
          // edges,
        },
        counter: counter + 1,
        ...rest
      };
      // {
      //         graph: {
      //           nodes: [
      //             ...nodes,
      //             { id, label: `Node ${id}`, color, x, y }
      //           ],
      //           edges: [
      //             ...edges,
      //             { from, to: id }
      //           ]
      //         },
      //         counter: id,
      //         ...rest
      //       }
    });
  };

  // setting up the graph
  const [state, setState] = useState({
    graph: {
      nodes: parseMyClassNodeData(myClassDataDict),
      edges: parseMyClassEdgeData(myClassDataDict),
    },
    counter: 0,
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
              {/* <label htmlFor="subjectCode">Subject Code (e.g. MATH)</label>
              <input type="text" id="subjectCode" />
              <label htmlFor="catalogNumber">Catalog Number (e.g. 136)</label>
              <input type="text" id="catalogNumber" />
              <label htmlFor="courseSeasons">Seasons course offered (e.g. F;W;S)</label>
              <input type="text" id="courseSeasons" />
              <label htmlFor="coursePrereqs">Course Prerequisites (e.g. MATH 136;MATH 138)</label>
              <input type="text" id="coursePrereqs" />
              <br />
              <button id="addCourse" onClick={addCourse}>Add Course</button> */}
              <AddCourseForm doFunctionAfterSubmit={addCourse} />
            </Container>
            <Container fluid>
              <label>Or, alternatively, import class data via a CSV:</label>
              <h6>Each row should be in the form of</h6>
              <h6>subjectCode,catalogNumber,courseSeasons,coursePrereqs</h6>
              <input type="file" accept="csv" id="classDataFile" />
            </Container>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
