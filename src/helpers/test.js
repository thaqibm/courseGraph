// Testing playground for functions
// import * as axios from 'axios';
// import { APIKEY } from "./config.js";
// import * as gcs from './get-course-data.js';

const axios = require('axios');
const config = require('../config');
const APIKEY = config.APIKEY;

const URL = "https://openapi.data.uwaterloo.ca/v3";

// get list of academic organizations
async function getListAcadOrgs() {
    return axios.get(`${URL}/AcademicOrganizations`, { headers: { "X-API-KEY": config.APIKEY } });
}

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

async function getSubjectList() {
    return axios.get(`${URL}/subjects`, { headers: { "X-API-KEY": APIKEY } });
}

// getListOfCoursesWithoutTermCode("ARABIC", console.log);

getSubjectList().then((result) => {
    const list = result.data.map((subject) => getListOfCourses(subject.code));
    // console.log(list);
    return Promise.all(list);
}).then((matrix) => {
    const dict = {};
    for (let i in matrix) {
        for (let j in matrix[i]) {
            // console.log(matrix[i]);
            dict[matrix[i][j].associatedAcademicGroupCode] = 1;
        }
    }
    return Object.keys(dict);
}).then(console.log);


