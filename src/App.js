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
    },
    "MATH 237": {
      "prereqs": ["MATH 136"],
      "seasons": ["F", "W", "S"],
    },
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
  }

  // revert edges back to normal (ie turn them all back to light grey)
  const revertEdgesToNormal = () => {
    setState(({ graph: { nodes, edges }, ...rest }) => {
      return { graph: { nodes, edges: edges.map((edge) => {return {...edge, color: '#bdbdbd'}}) }, ...rest };
    });
  }

  const [state, setState] = useState({
    graph: {
      nodes: parseMyClassNodeData(myClassDataDict),
      edges: parseMyClassEdgeData(myClassDataDict),
    },
    events: {
      // when selecting a node, "highlight" it 
      select: ({ nodes, edges }) => {
        highlightEdgesConnectedToNode(nodes[0]);
      },
      deselectNode: ({ ...other }) => { revertEdgesToNormal() },
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
