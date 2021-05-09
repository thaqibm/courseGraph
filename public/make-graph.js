/*
make-graph.js: initialises graph for website
*/

import {
    generateCourseNode,
    generateCourseEdge,
    parseMyClassEdgeData,
    parseMyClassNodeData
} from './parse-data.js';
import { colorLuminance } from './lighten-color.js';

var nodes, edges, container, network;

// run addCourse when button clicked
document.getElementById('addCourse').addEventListener("click", addCourse, false);

// addCourse: adds course `<subjectCode> <catalogNumber>` to graph
function addCourse() {
    let subjectCode = document.getElementById('subjectCode').value;
    let catalogNumber = document.getElementById('catalogNumber').value;
    // .filter(x => x) gets rid of empty strings
    let courseSeasons = document.getElementById('courseSeasons').value.split(";").filter(x => x);
    let prereqsList = document.getElementById('coursePrereqs').value.split(";").filter(x => x);

    try {
        nodes.add(generateCourseNode(subjectCode, catalogNumber, courseSeasons));
        for (let i in prereqsList) {
            edges.add(generateCourseEdge(subjectCode, catalogNumber, prereqsList[i].split(" ")[0], prereqsList[i].split(" ")[1]));
        }
    } catch (err) {
        console.log(err);
        alert("Bad course format, try again");
    };
}

document.getElementById("classDataFile").addEventListener("change", loadDataFromCSV, false)

// loadDataFromCSV: loads class data from CSV file
function loadDataFromCSV(e) {
    let filein = e.target.files[0];
    Papa.parse(filein, {
        download: true,
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
            initializeNetwork(classDataDict);
        }
    });
}

// initialiseNetwork: void function that initialises network
// based off of class data
function initializeNetwork(myClassDataDict) {
    // create nodes
    var nodeList = parseMyClassNodeData(myClassDataDict);
    console.log(nodeList);
    nodes = new vis.DataSet(nodeList);

    // create edges
    var edgeList = parseMyClassEdgeData(myClassDataDict);
    console.log(edgeList);
    edges = new vis.DataSet(edgeList);

    // create the network
    container = document.getElementById('mynetwork');

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
    network = new vis.Network(container, data, options);
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

initializeNetwork({});