// makes class data using the json class data object instead of the
// user defined csv

import * as gcs from './get-course-data.js';

import basicNodeConfig from '../config/basicNodeConfig.json';
import acadGroupsConfig from '../config/academicGroupsConfig.json';
import acadOrgsConfig from '../config/academicOrganizationsConfig.json';
import subjectCodesConfig from '../config/subjectCodesConfig.json';

// const classData = readFileSync('./classData.json');

// load classData from file
// const classData = JSON.parse(fs.readFileSync('./data/classData.json').toString());

// getCourseDetails: get details of course from classData

const courseSeasonDict = {
    'F': "🍁",
    'W': "❄️",
    'S': "🌷",
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

// generateCourseNode: takes in courseData and courseSeasons,
// outputs a node object
function generateCourseNode(course, courseSeasons) {

    let symCourseSeasons = courseSeasons
        .map((letter) => courseSeasonDict[letter])
        .join('');
    
    // title for course node
    const courseNodeTitle = `${course.subjectCode} ${course.catalogNumber} ${symCourseSeasons}`;

    // "set up" unicode for courseNode acadGroups and acadOrgs configs
    const nodeAcadGroupsConfig = acadGroupsConfig[course.associatedAcademicGroupCode]["symbolcode"];
    const nodeAcadOrgsConfig = acadOrgsConfig[course.associatedAcademicOrgCode]["symbolcode"];

    var courseNode = {
        id: `${course.subjectCode} ${course.catalogNumber}`,
        label: courseNodeTitle,
        // configurations for "generic" default basic node
        ...basicNodeConfig,
        // configurations for subject code
        ...subjectCodesConfig[course.subjectCode],
        // configurations for academic group
        ...((typeof nodeAcadGroupsConfig === "undefined")
            ? {}
            : {
                shape: 'icon',
                icon: {
                    face: "'Font Awesome 5 Free'",
                    weight: '700',
                    color: subjectCodesConfig[course.subjectCode]["color"]["background"],
                    // convert hexadecimal string to unicode
                    code: String.fromCharCode("0x" + nodeAcadGroupsConfig),
                    size: 40,
                }
            }),
        // configurations for academic organization
        ...((nodeAcadOrgsConfig === "f111")
            ? {}
            : {
                shape: 'icon',
                icon: {
                    face: "'Font Awesome 5 Free'",
                    weight: '700',
                    color: subjectCodesConfig[course.subjectCode]["color"]["background"],
                    // convert hexadecimal string to unicode
                    code: String.fromCharCode("0x" + nodeAcadOrgsConfig),
                    size: 40,
                }
            }),
    }

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
        color: {
            color: '#bdbdbd',
            inherit: 'from',
        },
    }
    return courseEdge;
}

// parseMyClassNodeData: parses my (ie given) class data, returns list of nodes corresponding to them
// myClassDataDict is in the form { <course code>: { prereqs: <list of course prereqs>, seasons: <list of seasons> } }
// where <course code> = `<subject code> <catalog number>`
async function parseMyClassNodeData(myClassDataDict) {
    return gcs.getCurrentTermData()
        .then((result) => {
            return Promise.all(
                Object.keys(myClassDataDict)
                    .map((course) => gcs.getCourseWithTermCode(
                        course.split(" ")[0],
                        course.split(" ")[1],
                        result.data.termCode
                    ))
            );
        })
        .then((courseList) => {
            return courseList
                .map((course) => {
                    let courseData = course.data[0];
                    let courseSeasons = myClassDataDict[`${course.data[0].subjectCode} ${course.data[0].catalogNumber}`].seasons;
                    return { data: courseData, seasons: courseSeasons };
                });
        })
        .then((courseDataList) => {
            return courseDataList.map((courseData) => generateCourseNode(courseData.data, courseData.seasons));
        });
}

// parseMyClassEdgeData: parses my (ie given) class data, returns list of nodes corresponding
// to myClassDataDict, which is in the form described above
// this function is synchronous
function parseMyClassEdgeData(myClassDataDict) {
    let parsedEdgeData = [];
    for (let code in myClassDataDict) {
        parsedEdgeData = parsedEdgeData.concat(myClassDataDict[code]['prereqs']
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

export { courseSeasonDict, generateCourseNode, generateCourseEdge, parseMyClassEdgeData, parseMyClassNodeData };