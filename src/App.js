// Constructs the React Application

import Graph from "react-graph-vis";
import React, { useState } from "react";
import ReactDOM from "react-dom";

import { generateCourseNode, generateCourseEdge, parseMyClassEdgeData, parseMyClassNodeData } from './parse-data.js';
import { colorLuminance } from './lighten-color.js';

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

// function randomColor() {
//   const red = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
//   const green = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
//   const blue = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
//   return `#${red}${green}${blue}`;
// }

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
  const myClassDataDict = {
    "MATH 135": {
      "prereqs": [],
      "seasons": ["F", "W", "S"],
    },
    "MATH 136": {
      "prereqs": ["MATH 135"],
      "seasons": ["F", "W", "S"],
    }
  };

  const [state, setState] = useState({
    graph: {
      nodes: parseMyClassNodeData(myClassDataDict),
      edges: parseMyClassEdgeData(myClassDataDict),
    },
    events: {
      // select: ({ nodes, edges }) => {
      //   console.log("Selected nodes:");
      //   console.log(nodes);
      //   console.log("Selected edges:");
      //   console.log(edges);
      //   alert("Selected node: " + nodes);
      // },
      // doubleClick: ({ pointer: { canvas } }) => {
      //   createNode(canvas.x, canvas.y);
      // }
    }
  })
  const { graph, events } = state;

  // const style = {
  //   height: "640px",
  //   width: "100%"
  // }
  return (
    <div id="mynetwork">
      <Graph graph={graph} options={options} events={events} />
    </div>
  );

}

export default App;
