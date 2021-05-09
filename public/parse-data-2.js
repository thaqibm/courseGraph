// makes class data using the json class data object instead of the
// user defined csv

// const fs = require('fs')

import { classData } from './classData.js';

// getClassData: custom function to read JSON file, and performs
// the fn (which takes classData as a parameter) after loading it
// var classData = {};
// function getClassData(fn) { 
//     var xhr = new XMLHttpRequest(); 
//     xhr.open('GET', 'classData.json', true); 
//     xhr.responseType = 'blob'; 
//     xhr.onload = function(e) {  
//       if (this.status == 200) { 
//           var file = new File([this.response], 'temp'); 
//           var fileReader = new FileReader(); 
//           fileReader.addEventListener('load', function() { 
//                fn(fileReader.result);
//           }); 
//           fileReader.readAsText(file); 
//       }  
//     } 
//     xhr.send(); 
// } 

// getClassData(console.log);

console.log(classData);

// load classData from file
// const classData = JSON.parse(fs.readFileSync('./data/classData.json').toString());
// console.log(classData);

const courseSeasonDict = {
    1209: "🍁",
    1211: "❄️",
    1215: "🌷",
}

// stringParse(string): takes in a single "line" string, parses it; 
// ie includes \n characters every ~50 characters for brevity 
function stringParse(string) {
    let remainder = string;
    let result = "";
    let count = 0; // count: number of chars on the line

    while (true) {
        if (remainder === "") return result;

        if (count > 50 && remainder.charAt(0) === " ") {
            result += "\n";
            remainder = remainder.substr(1);
            count = 0;
        }

        result += remainder.charAt(0);
        remainder = remainder.substr(1);
        count++;
    }
}

// generateCourseNode: takes in parameters, generates node for course
// that can be used in make-graph.js
function generateCourseNode(subjectCode, catalogNumber) {
    
    let courseData = classData[subjectCode][catalogNumber];
    let course = courseData[Object.keys(courseData)[0]];
    // get course seasons
    let courseSeasons = Object.keys(courseData)
        .map((num) => courseSeasonDict[num])
        .join('');

    // console.log(courseSeasons);
    // console.log(courseData[Object.keys(courseData)[0]]);

    const courseNodeDescription =
        `${subjectCode} ${catalogNumber} (${course.title})\nCourse ID: ${course.id}\n--------------------------\n${stringParse(course.description)}\n--------------------------\n${course.requirementsDescription}\n`;
    // console.log(courseNodeDescription);
    const courseNodeTitle = (subjectCode === "HS") ? subjectCode : `${subjectCode} ${catalogNumber} ${courseSeasons}`;
    // console.log(courseNodeTitle);

    // we can experiment with popups instead of hovering when
    // the node is clicked
    var courseNode = {
        id: `${subjectCode} ${catalogNumber}`,
        label: courseNodeTitle,
        title: courseNodeDescription,
        labelHighLightBold: true,
        borderWidth: 1.5,
        font: {
            face: 'Lato',
            size: 16,
            multi: 'html',
        },
        nodes: {

        },
        shapeProperties: {
            borderRadius: 2.5,
        }
    }

    // function to update properties of course node
    let updateCourseNode = function (courseNode, properties) {
        return { ...courseNode, ...properties };
    }

    // we could make this into a switch statement, or even use a csv
    // to store the properties
    let colorShapeProperties = {};
    // console.log(courseSubject);
    if (subjectCode === "MATH") { // green
        colorShapeProperties = {
            color: {
                background: '#169131',
                border: 'black',
                highlight: {
                    background: '#81f087',
                    border: 'black',
                }
            },
            shape: 'diamond',
            size: 15,
        };
    }
    else if (subjectCode === "STAT") { // yellow
        colorShapeProperties = {
            color: {
                background: '#d5db16',
                border: 'black',
                highlight: {
                    background: '#f7fa8c',
                    border: 'black',
                }
            },
            shape: 'hexagon',
            size: 15,
        }
    }
    else if (subjectCode === "CS") { // orange
        colorShapeProperties = {
            color: {
                background: '#eb7c28',
                border: 'black',
                highlight: {
                    background: '#edb68c',
                    border: 'black',
                }
            },
            shape: 'star',
            size: 15,
        };
    }
    else if (subjectCode === "CO") { // aqua
        colorShapeProperties = {
            color: {
                background: '#0ebfc2',
                border: 'black',
                highlight: {
                    background: '#63e8eb',
                    border: 'black',
                }
            },
            shape: 'triangleDown',
            size: 12,
        };
    }
    else if (subjectCode === "PMATH") { // pink
        colorShapeProperties = {
            color: {
                background: '#d40dc0',
                border: 'black',
                highlight: {
                    background: '#f294e9',
                    border: 'black',
                }
            },
            shape: 'dot',
            size: 12,
        }
    }
    else if (subjectCode === "HS") { // blue
        colorShapeProperties = {
            color: {
                background: 'blue',
                border: 'black',
            },
            shape: 'dot',
            size: 8,
            fixed: true,
        }
    }
    else if (subjectCode === "SPCOM" || subjectCode === "ENGL") { // purple
        colorShapeProperties = {
            color: {
                background: '#661499',
                border: 'black',
                highlight: {
                    background: '#c578f5',
                    border: 'black',
                }
            },
            shape: 'triangle',
            size: 12,
        }
    }
    else { // red
        colorShapeProperties = {
            color: {
                background: '#a30b2c',
                border: 'black',
                highlight: {
                    background: '#e66e88',
                    border: 'black',
                }
            },
            shape: 'square',
            size: 12,
        };
    }

    courseNode = updateCourseNode(courseNode, colorShapeProperties);

    return courseNode;
}

// generateCourseEdge: generates course edge from a prereq
// course node of the course to the original course
function generateCourseEdge(subjectCode, catalogNumber, subjectCodePrereq, catalogNumberPrereq) {
    const courseEdge = {
        id: `${subjectCodePrereq} ${catalogNumberPrereq} -> ${subjectCode} ${catalogNumber}`,
        title: `${subjectCodePrereq} ${catalogNumberPrereq} -> ${subjectCode} ${catalogNumber}`,
        from: `${subjectCodePrereq} ${catalogNumberPrereq}`,
        to: `${subjectCode} ${catalogNumber}`,
        arrows: 'to',
        color: '#bdbdbd',
    }
    return courseEdge;
}

// parseMyClassNodeData: parses my (ie given) class data, returns list of nodes corresponding to them
// myClassDataDict is in the form { <course code>: <list of course prereqs> }
// where <course code> = `<subject code> <catalog number>`
function parseMyClassNodeData(myClassDataDict) {
    return Object.keys(myClassDataDict).map((c) => {
        return generateCourseNode(c.split(" ")[0], c.split(" ")[1]);
    })
}
// parseMyClassEdgeData: parses my (ie given) class data, returns list of nodes corresponding
// to myClassDataDict, which is in the form described above
function parseMyClassEdgeData(myClassDataDict) {
    let parsedEdgeData = [];
    for (let code in myClassDataDict) {
        parsedEdgeData = parsedEdgeData.concat(myClassDataDict[code]
            .map((prereqCode) => {
                return generateCourseEdge(
                    code.split(" ")[0],
                    code.split(" ")[1],
                    prereqCode.split(" ")[0],
                    prereqCode.split(" ")[1]
                )
            }));
    }
    return parsedEdgeData;
}

// console.log(parseMyClassEdgeData({"MATH 135": [], "MATH 136": ["MATH 135"], "MATH 237": ["MATH 135", "MATH 136"]}));

export { parseMyClassEdgeData, parseMyClassNodeData };