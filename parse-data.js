import { parseCsvData } from "./parseCsvData.js";

// parseData.js: takes in data from csv, parses it into
// respective node and edge data
// to be sent to make-graph.js

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

// generateCourseData: takes in parameters, generates node for course
// that can be used in make-graph.js
function generateCourseNode(courseCode, courseName, courseDesc, courseLevel, courseSeasons, coursePrereq) {
    const courseDescription = courseCode + " (" + courseName + ")\n"
        + "--------------------------------" + "\n"
        + stringParse(courseDesc);
    const courseTitle = (courseCode === "HS") ? courseCode : courseCode + " " + courseSeasons;
    var courseNode = {
        id: courseCode,
        label: courseTitle,
        title: courseDescription,
        level: courseLevel,
        labelHighLightBold: true,
        borderWidth: 1.5,
        // color: {
        //     border: 'green',
        // },
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

    let updateCourseNode = function (courseNode, properties) {
        return { ...courseNode, ...properties };
    }

    let courseSubject = courseCode.split(" ")[0];
    let colorShapeProperties = {};
    // console.log(courseSubject);
    if (courseSubject === "MATH") { // green
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
    else if (courseSubject === "STAT") { // yellow
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
    else if (courseSubject === "CS") { // orange
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
    else if (courseSubject === "CO") { // aqua
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
    else if (courseSubject === "PMATH") { // pink
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
    else if (courseSubject === "HS") { // blue
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
    else if (courseSubject === "SPCOM" || courseSubject === "ENGL") { // purple
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

// generateCourseEdge: generates course edge from every
// element of courseCodePrereq to courseCode
function generateCourseEdge(courseCode, courseCodePrereq) {
    const courseEdge = {
        id: courseCodePrereq + " -> " + courseCode,
        title: courseCodePrereq + " -> " + courseCode,
        from: courseCodePrereq,
        to: courseCode,
        arrows: 'to',
        color: '#bdbdbd',
    }
    return courseEdge;
}

// parseClassData: returns parsed class data (for nodes)
function parseClassData(classData) {
    var c;
    var parsedClassData = []; // for node data

    for (c in classData) {
        let course = classData[c];
        // console.log(course);
        parsedClassData.push(generateCourseNode(
            course.courseCode,
            course.courseName,
            course.courseDescription,
            course.courseLevel,
            course.courseSeasons,
            course.courseCodePrereq
        ));
    }
    return parsedClassData;
}

// parseClassPrereqData: returns parsed class prereq data (for edges)
function parseClassPrereqData(classData) {
    var c;
    var parsedClassPrereqData = []; // for edge data

    for (c in classData) {
        let course = classData[c];
        for (var i = 0; i < course.coursePrereq.length; i++) {
            parsedClassPrereqData.push(generateCourseEdge(
                course.courseCode,
                course.coursePrereq[i],
            ))
        }
    }
    return parsedClassPrereqData;
}

// exports parse class data functions
export { parseClassData, parseClassPrereqData };