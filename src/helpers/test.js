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

async function getListOfCourses(subjectCode, termcode) {
    return axios.get(`${URL}/Courses/${termcode}/${subjectCode}`, { headers: { "X-API-KEY": APIKEY } });
}

async function getListOfCoursesWithoutTermCode(subjectCode, callback) {
    getCurrentTermData((result) => {
        console.log(result);
        console.log(result.data.termCode);
        getListOfCourses(subjectCode, result.data.termCode, callback);
    });
}

async function getSubjectList() {
    return axios.get(`${URL}/subjects`, { headers: { "X-API-KEY": APIKEY } });
}

// getListOfCoursesWithoutTermCode("ARABIC", console.log);

async function t1() {
    console.log(1);
    return 2;
}

async function t2() {
    await t1().then((result) => {
        console.log("a is" + result);
        return 3;
    }).then((result) => {
        console.log("b is" + result);
        return 4;
    })
}

async function t3() {
    await t2().then((result) => {
        console.log("c is" + result);
        return 5;
    })
}

// t3().then((result) => console.log("d is" + result));

getListAcadOrgs().then((result) => {
    console.log(result.data);
})


