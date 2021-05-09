
// const fs = require('fs');

// console.log(fs.readFileSync(`${__dirname}/test.txt`).toString());

const axios = require('axios');
const config = require("../config");

const URL = "https://openapi.data.uwaterloo.ca/v3";

async function getEnrolledStudents(subjectCode, catalogNumber) {
    return axios.get(`${URL}/ClassSchedules/1211/${subjectCode}/${catalogNumber}`, { headers: { "X-API-KEY": config.APIKEY } })
        .then(function (result) {
            // console.log(result.data);
            let rd = result.data;
            let acc = 0;
            for (i in rd) {
                let section = rd[i];
                if (section.courseComponent === 'LEC') {
                    acc += section.enrolledStudents;
                }
            }
            console.log(acc);
        }).catch(function (err) {
            console.log(err);
        })
}

// test('AFM', '101');
getEnrolledStudents('CS', '146');

