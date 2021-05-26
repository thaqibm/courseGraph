// Helper script to create test class data
// to visualize all the configurations for each subject code

const axios = require('axios');
const { APIKEY } = require('../config');
const { unparse } = require('papaparse');
const { ExportToCsv } = require('export-to-csv');
const { writeFileSync, writeFile } = require('fs');

const URL = "https://openapi.data.uwaterloo.ca/v3";

async function getSubjectList() {
    return axios.get(`${URL}/subjects`, { headers: { "X-API-KEY": APIKEY } });
}

// imported functions from get-course-data
async function getCurrentTermData() {
    return axios.get(`${URL}/Terms/current`, { headers: { "X-API-KEY": APIKEY } });
}

async function getListOfCoursesH(subjectCode, termcode) {
    return axios.get(`${URL}/Courses/${termcode}/${subjectCode}`, { headers: { "X-API-KEY": APIKEY } });
}

// get list of courses with subject code
async function getListOfCourses(subjectCode) {
    return getCurrentTermData()
        .then((result) => {
            return result.data.termCode;
        })
        .then((termCode) => {
            return getListOfCoursesH(subjectCode, termCode);
        })
        .then((result) => {
            return result.data;
        })
        .catch((err) => {
            return [];
        })
}

// make a list of courses, with one course from each subject code
async function makeTestClassData() {
    return getSubjectList().then((result) => {
        const promiseList = result.data.map((subject) => getListOfCourses(subject.code));
        return Promise.all(promiseList);
    }).then((list) => {
        const myCourseList = list
            .map((listOfCourses) => listOfCourses[0])
            .filter((course) => typeof course !== "undefined");
        return myCourseList;
    })
    // convert to CSV format
    .then((myCourseList) => {
        return myCourseList.map((course) => 
            [course.subjectCode, course.catalogNumber, "", ""].join(",")
        ).join("\n");
    })
    // make CSV containing test class data
    .then((csvdata) => {
        writeFileSync("example-class-data/all-subject-codes-class-data.csv", csvdata);
    })
}

makeTestClassData();

