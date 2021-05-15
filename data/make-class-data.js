// make-db.js: "makes" the database for which courses will be stored
// stores it in (localhost) sql database
// table name: my_class_data, which has the columns
// courseId, courseCode, courseName, courseDescription (not NULL)
// (these are added in directly from the courseGraph API)
// and the columns
// coursePrereq, courseSeasons
// which are added in manually

/* EXAMPLE COURSE
{
  courseId: '013391',
  termCode: '1211',
  termName: 'Winter 2021',
  associatedAcademicCareer: 'GRD',
  associatedAcademicGroupCode: 'MAT',
  associatedAcademicOrgCode: 'STATACTSC',
  subjectCode: 'ACTSC',
  catalogNumber: '613',
  title: 'Statistics for Actuarial Science',
  descriptionAbbreviated: 'Statistics for Actuarial Sci',
  description: 'Discrete and continuous random variables; generating functions; dependence; maximum likelihood estimation, functions of random variables; confidence intervals, hypothesis tests; Bayesian estimation, simple linear regression.',
  gradingBasis: 'NUM',
  courseComponentCode: 'LEC',
  enrollConsentCode: 'D',
  enrollConsentDescription: 'No Consent Required',
  dropConsentCode: 'N',
  dropConsentDescription: 'No Consent Required',
  requirementsDescription: null
}
*/

// So far, this can only be run on node.js, since
// it requires node modules

const mysql = require('mysql');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const throttledQueue = require('throttled-queue');
const fs = require('fs');
const fetch = require('node-fetch');
const config = require("../config");

const URL = "https://openapi.data.uwaterloo.ca/v3";

// allow one operation every 10 seconds
let throttle = throttledQueue(1, 10000);

// getSubjectList(): gets lists of subjects directly from the UW API
// subjects have: code, name, descAbbr, desc and associated academic code
async function getSubjectList() {
    return axios.get(`${URL}/subjects`, { headers: { "X-API-KEY": config.APIKEY } });
}

// getListOfCourses: returns promise containing data of all the courses
// with subjectCode "subjectCode"
// see commented code for example usage
// example: // getListOfCourses("MATH", 1211);
async function getListOfCourses(subjectCode, termcode) {
    return axios.get(`${URL}/Courses/${termcode}/${subjectCode}`, { headers: { "X-API-KEY": config.APIKEY } });
}

// getCourse(courseCode): returns *promise* containing data of course with
// courseCode = subjectCode + " " + catalogNumber, and termcode "termcode"
// example usage: // getCourse("MATH", "135", "1211", () => {...});
async function getCourse(subjectCode, catalogNumber, termcode) {
    return axios.get(`${URL}/Courses/${termcode}/${subjectCode}/${catalogNumber}`, { headers: { "X-API-KEY": config.APIKEY } });
}

// getClassSchedule(subjectCode, catalogNumber): gets "class schedule" of course
async function getClassSchedule(subjectCode, catalogNumber, termcode) {
    return axios.get(`${URL}/ClassSchedules/${termcode}/${subjectCode}/${catalogNumber}`, { headers: { "X-API-KEY": config.APIKEY } });
}


// 1205 = S2020, 1209 = F2020, 1211 = W2021, (1215 = S2021)
const termcodes = [1209, 1211, 1215];

// main function: make json object pertaining to class data
async function main() {

    // get subject list
    getSubjectList()

    // for each subject, push the promise pertaining to the (subject code + catalog number + term code) course
    .then(function (result) {
        console.log("Subject list has been obtained");
        // promises contains the list of courses
        let promises = [];
        for (let i in result.data) {
            for (let j in termcodes) {
                promises.push(getListOfCourses(result.data[i].code, termcodes[j]));
            }
            // promises.push(getListOfCourses(result.data[i].code, termcode));
        }
        // console.log(promises);
        return Promise.all(
            // "map" maps all the promises that return errors to *null*
            promises.map(p => p.catch(error => null))
        );
    })

    // then, process the course list and make the json object containing class data
    .then(function (resolvedPromises) {
        console.log("Course list has been obtained");
        // see the code below for the params
        let classData = {};
        for (let i in resolvedPromises) {
            if (resolvedPromises[i] != null) {
                let data = resolvedPromises[i].data;
                for (let j in data) {
                    let course = data[j];

                    // initialise classData params if subjectCode or catalogNumber is not initialised
                    // in classData
                    if (typeof classData[course.subjectCode] === "undefined") {
                        classData[course.subjectCode] = {};
                    }
                    if (typeof classData[course.subjectCode][course.catalogNumber] === "undefined") {
                        classData[course.subjectCode][course.catalogNumber] = {};
                    }

                    // add course to classData
                    classData[course.subjectCode][course.catalogNumber][course.termCode] = {
                        id: course.courseId,
                        assocAcadGrpCode: course.associatedAcademicGroupCode,
                        assocAcadCareer: course.associatedAcademicCareer,
                        title: course.title,
                        description: course.description,
                        courseComponentCode: course.associatedAcademicGroupCode,
                        enrollConsentCode: course.enrollConsentCode,
                        enrollConsentDescription: course.enrollConsentDescription,
                        dropConsentCode: course.dropConsentCode,
                        dropConsentDescription: course.dropConsentDescription,
                        requirementsDescription: course.requirementsDescription
                    }
                    
                }
            }
        }
        return classData;
    })

    // then, write classData object to classData.json file
    .then(function (classData) {
        fs.writeFile("src/classData.json", `const classData = ${JSON.stringify(classData)};\nexport { classData };`, (err) => {
            if (err) throw err;
        })
        console.log("Class data has been written");
    })
    
    // catch and print any errors
    .catch(function (error) {
        console.log(error);
    });
}

main();


