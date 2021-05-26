// // helper functions to retrieve course data using the UW API

import * as axios from 'axios';
import {APIKEY} from "./config";

const URL = "https://openapi.data.uwaterloo.ca/v3";

// // getSubjectList(): gets lists of subjects directly from the UW API
// // subjects have: code, name, descAbbr, desc and associated academic code
// // callback takes in the result of the promise
export async function getSubjectList() {
    return axios.get(`${URL}/subjects`, { headers: { "X-API-KEY": APIKEY } });
}

// // getListOfCourses: returns promise containing data of all the courses
// // with subjectCode "subjectCode"
// // see commented code for example usage
// // example: // getListOfCourses("MATH", 1211);
// // callback takes in the result of the promise
export async function getListOfCourses(subjectCode, termcode) {
    return axios.get(`${URL}/Courses/${termcode}/${subjectCode}`, { headers: { "X-API-KEY": APIKEY } });
}

// // getTermData: returns term data
// // callback takes in the result of the promise
export async function getTermData(callback) {
    return axios.get(`${URL}/Terms`, { headers: { "X-API-KEY": APIKEY } });
}

// // getTermData: returns term data for a term code
// // callback takes in the result of the promise
export async function getSpecificTermData(termcode) {
    return axios.get(`${URL}/Terms/${termcode}`, { headers: { "X-API-KEY": APIKEY } });
}

// // getCurrentTermData: returns term data for current term
// // callback takes in the result of the promise
export async function getCurrentTermData() {
    return axios.get(`${URL}/Terms/current`, { headers: { "X-API-KEY": APIKEY } });
}

// // getCurrentYearTermData: returns term data for current year
// // contains the terms S, F, W in that order
// // callback takes in the result of the promise
export async function getTermDataForYear(year) {
    return axios.get(`${URL}/Terms/foracademicyear/${year}`, { headers: { "X-API-KEY": APIKEY } });
}

// // getCourse: returns *promise* containing data of course with
// // courseCode = subjectCode + " " + catalogNumber, and termcode "termcode"
// // example usage: // getCourse("MATH", "135", "1211);
// // callback takes in the result of the promise
export async function getCourseWithTermCode(subjectCode, catalogNumber, termcode) {
    return axios.get(`${URL}/Courses/${termcode}/${subjectCode}/${catalogNumber}`, { headers: { "X-API-KEY": APIKEY } });
}

// get list of academic organizations
export async function getListAcadOrgs() {
    return axios.get(`${URL}/AcademicOrganizations`, { headers: { "X-API-KEY": APIKEY } });
}

export async function getCourse(subjectCode, catalogNumber) {
    return getCurrentTermData().then((result) => {
        return result.data.termCode;
    }).then((termCode) => {
        return getCourseWithTermCode(subjectCode, catalogNumber, termCode);
    })
}

// // getListOfCoursesWithoutTermCode: returns list of courses corresponding to subjectCode
// export async function getListOfCoursesWithoutTermCode(subjectCode, callback) {
//     getCurrentTermData((result) => getListOfCoursesWithoutTermCode(subjectCode, result.data.termCode, callback));
// }

// // getCourse: returns *promise* containing data of course with
// // courseCode = subjectCode + " " + catalogNumber, and termcode "termcode"
// // example usage: // getCourse("MATH", "135", "1211);
// // callback takes in the result of the promise
// export async function getCourseWithoutTermCode(subjectCode, catalogNumber, callback) {
//     getCurrentTermData((result) => getCourseWithTermCode(subjectCode, catalogNumber, result.data.termCode, callback));
// }

// // getClassSchedule: gets "class schedule" for course
// // callback takes in the result of the promise
export async function getClassSchedule(subjectCode, catalogNumber, termcode) {
    return axios.get(`${URL}/ClassSchedules/${termcode}/${subjectCode}/${catalogNumber}`, { headers: { "X-API-KEY": APIKEY } });
}

// // getNumberOfEnrolledStudents: gets number of enrolled students in course
// // callback takes in the number of enrolled students as a parameter
// // callback takes in the result of the promise
// export async function getNumberOfEnrolledStudents(subjectCode, catalogNumber, termcode, callback) {
//     getClassSchedule(subjectCode, catalogNumber, termcode, (result) => {
//         callback(result.data
//             .map((course) => course.enrolledStudents)
//             .reduce((a, b) => a + b));
//     })
// }

// // getNumberOfEnrolledStudents("MATH", "135", "1209", console.log)


