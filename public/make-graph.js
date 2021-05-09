/*
make-graph.js: initialises graph for website
*/

import { parseClassData, parseClassPrereqData } from './parse-data.js';
import { parseCsvData } from './parseCsvData.js';
import { parseMyClassEdgeData, parseMyClassNodeData } from './parse-data-2.js';
import { colorLuminance } from './lighten-color.js';

// initialiseNetwork: void function that initialises network
// based off of class data
function initialiseNetwork(myClassDataDict) {
    // create nodes
    var nodeList = parseMyClassNodeData(myClassDataDict);
    console.log(nodeList);
    var nodes = new vis.DataSet(nodeList);

    // create edges
    var edgeList = parseMyClassEdgeData(myClassDataDict);
    console.log(edgeList);
    var edges = new vis.DataSet(edgeList);

    // create the network
    var container = document.getElementById('mynetwork');

    // provide the data in the vis format
    var data = {
        nodes: nodes,
        edges: edges,
    };

    // provide options (characteristics) of canvas
    var options = {
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
    }


    // initialise network
    var network = new vis.Network(container, data, options);
    // network.startSimulation();


    // when node is selected, change color of edges coming to and from
    // the node
    // change all arrows to black first
    network.on("selectNode", function (params) {
        // console.log(params.edges);
        // console.log(params.nodes[0]);
        let selectedNodeId = params.nodes[0];
        let selectedNode = nodes.get(selectedNodeId);
        let selectedNodeBackground = selectedNode.color.background;
        // console.log(selectedNode.color);
        // params.edges = edges connected to node
        let edgeList = [];
        var edge;
        for (var edge in params.edges) {
            // console.log(params.edges[edge]);
            edgeList.push(edges.get(params.edges[edge]));
        }
        // edgeList now contains all the *edges* (NOT just edge ids)
        // that is connected to the node
        // console.log(edgeList);
        // console.log("#" + selectedNode.color.background);

        for (var edge in edgeList) {
            // console.log(edgeList[edge].id.split(" => "));
            let fromNodeId = edgeList[edge].id.split(" -> ")[0];
            // console.log(fromNodeId)
            // console.log(params.nodes[0]);
            // console.log(fromNodeId === params.nodes[0]);
            // console.log(lightenColor(selectedNode.color.background, 80));
            if (fromNodeId === params.nodes[0]) {
                // for "outgoing" arrows
                edgeList[edge] = {
                    // color: '#4c4c4c',
                    color: colorLuminance(selectedNodeBackground, -0.4),
                    id: edgeList[edge].id,
                };
            }
            else {
                // for "incoming" arrows
                edgeList[edge] = {
                    color: colorLuminance(selectedNodeBackground, 0),
                    id: edgeList[edge].id,
                }
            }
            // console.log(edgeList[edge]);
            edges.update(edgeList[edge]);
        }
    })

    // when node is deselected, change color of edges back to grey, or
    // #bdbdbd
    network.on("deselectNode", function (params) {
        // console.log(params.previousSelection.nodes[0].edges);
        // edgeIdList contains all the edge ids of the edges
        // that were connected to the deselected node
        let edgeIdList = params.previousSelection.nodes[0].edges;
        // console.log(edgeIdList);
        // params.edges = edges connected to node
        let edgeList = [];
        var edge;
        for (var i in edgeIdList) {
            // console.log(edgeIdList[i]);
            edgeList.push(edgeIdList[i]);
        }
        // edgeList now contains all the *edges* (NOT just edge ids)
        // that is connected to the node
        // console.log(edgeList);

        for (var edge in edgeList) {
            edgeList[edge] = {
                color: '#bdbdbd',
                id: edgeList[edge].id,
            }
            edges.update(edgeList[edge]);
        }
        // network.stopSimulation();
    })

    // get seed of layout when double click
    network.on("doubleClick", function (params) {
        console.log(network.getSeed());
    })
}


// Papa.parse("class-data.csv", {
//     comments: "//",
//     delimiter: ";; ",
//     download: true,
//     complete: function (results) {
//         // console.log(results.data);
//         initialiseNetwork(parseCsvData(results.data));
//     }
// });

initialiseNetwork({});