// make-db.js: "makes" the database for which courses will be stored
// stores it in (localhost) sql database
// table name: my_class_data, which has the columns
// courseId, courseCode, courseName, courseDescription (not NULL)
// (these are added in directly from the courseGraph API)
// and the columns
// coursePrereq, courseSeasons
// which are added in manually

const mysql = require('mysql');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const throttledQueue = require('throttled-queue');
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

// parseClassData(result): takes result from getCourseDoCommand, and
// parses the class data; returns JSON object containing relevant
// information
function parseClassData(result) {
    let cd = result.data; // json object containing data
    return {
        courseId: cd.courseId,
        courseCode: cd.subjectCode + " " + cd.catalogNumber,
        courseName: cd.title,
        courseDescription: cd.description,
    }
}

// connect(sql): takes in a sql command sql, performs said command
// on the my_class_data table
function connect(sql) {
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "Hacknil8--", // my localhost pw would go here
        database: "class_data",
    });
    console.log("Querying the server: ");

    con.connect(function (err) {
        if (err) throw err;
        console.log("Connected to database!");
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Query has been successfully completed");
        })

        con.end(function (err) {
            if (err) {
                return console.log("Error: " + err.message);
            }
            console.log("Closed the database connection.")
        })
    });
}

// 1205 = S2020, 1209 = F2020, 1211 = W2021, (1215 = S2021)
const termcodes = [1205, 1209, 1211];
async function main() {

    // first, get subject list and for each subject, the course list
    // then, process the course list and make the sql query
    // then create the sql query, create the table and insert values
    getSubjectList().then(function (result) {
        console.log("Subject list has been obtained");
        let promises = [];
        for (let i in result.data) {
            for (let j in termcodes) {
                promises.push(getListOfCourses(result.data[i].code, termcodes[j]));
            }
            // promises.push(getListOfCourses(result.data[i].code, termcode));
        }
        return Promise.all(
            // "map" maps all the promises that return errors to *null*
            promises.map(p => p.catch(error => null))
        );
    }).then(function (resolvedPromises) {
        console.log("Course list has been obtained");
        // sql is a list of the "VALUES" to be added to the database
        // see the code below for the params
        let sql = [];
        for (let i in resolvedPromises) {
            // print course data if course is valid
            if (resolvedPromises[i] != null) {
                let data = resolvedPromises[i].data;
                for (let j in data) {
                    let course = data[j];
                    // console.log(`${data[j].subjectCode} ${data[j].catalogNumber}`);
                    // console.log(data[j]);

                    // courseId is NOT NECESSARILY unique; eg ACTSC 291 and AFM 272

                    // we replace the double quotes with the "&" symbol for processing purposes
                    sql.push(`("${course.courseId}", ` +
                        `"${course.termCode}", ` +
                        `"${course.subjectCode}", ` +
                        `"${course.catalogNumber}", ` +
                        `"${course.associatedAcademicGroupCode}", ` +
                        `"${course.associatedAcademicCareer}", ` +
                        `"${course.title.replace(/["]+/g, '&')}", ` +
                        `"${course.description.replace(/["]+/g, '&')}", ` +
                        `"${course.courseComponentCode}", ` +
                        `"${course.enrollConsentCode}", ` +
                        `"${course.enrollConsentDescription}", ` +
                        `"${course.dropConsentCode}", ` +
                        `"${course.dropConsentDescription}", ` +
                        `"${course.requirementsDescription}")`.replace(/(\r\n|\n|\r)/gm, ""));
                }
            }
        }
        // console.log(sql);
        return sql;

    }).then(function (sql) {

        console.log("Course list has been successfully processed");
        // insertsqlcommands: list of SQL INSERT INTO commands to put course data into the DB
        let insertsqlcommands = [];
        // let sql = sqll.slice(0, 10);
        for (let c in sql) {
            insertsqlcommands.push(`INSERT INTO my_class_data2 VALUES ${sql[c]};`);
        }

        // dropsqlcommand: SQL command to drop table (throw away previous entries)
        let dropsqlcommand = "DROP TABLE my_class_data2";

        // createsqlcommand: SQL CREATE TABLE command to initialise table
        let createsqlcommand = "CREATE TABLE IF NOT EXISTS my_class_data2 ("
            + "courseId VARCHAR(6),"
            + "termCode VARCHAR(4),"
            + "subjectCode VARCHAR(10),"
            + "catalogNumber VARCHAR(10),"
            + "associatedAcademicGroupCode VARCHAR(6),"
            + "associatedAcademicCareer VARCHAR(6),"
            + "title VARCHAR(255),"
            + "courseDescription VARCHAR(4095),"
            + "courseComponentCode VARCHAR(15),"
            + "enrollConsentCode VARCHAR(15),"
            + "enrollConsentDescription VARCHAR(255),"
            + "dropConsentCode VARCHAR(15),"
            + "dropConsentDescription VARCHAR(255),"
            + "requirementsDescription VARCHAR(1023)"
            + ")";

        // connect to server and execute both create and insert commands

        const con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "", // my localhost pw would go here
            database: "class_data",
        });
        console.log("Querying the server: ");

        con.connect(function (err) {
            if (err) throw err;
            console.log("Connected to database!");

            con.query(dropsqlcommand, function (err, result) {
                if (err) throw err;
                console.log("Previous table has been dropped");
            })

            con.query(createsqlcommand, function (err, result) {
                if (err) throw err;
                console.log("Table has been successfully initialised");
            })

            for (i in insertsqlcommands) {
                con.query(insertsqlcommands[i], function (err, result) {
                    if (err) throw err;
                    // console.log(`Value #${i} have been successfully inserted`);
                })
            }
            // con.query(insertsqlcommand, function (err, result) {
            //     if (err) throw err;
            //     console.log("Values have been successfully inserted");
            // })

            con.end(function (err) {
                if (err) {
                    return console.log("Error: " + err.message);
                }
                console.log("Closed the database connection.")
            })
        });


    }).catch(function (error) {
        console.log(error);
    });
}

/* QUERY TO DISPLAY DATA
SELECT * FROM my_class_data2 
ORDER BY subjectCode, catalogNumber
LIMIT 0, 10000;
*/

main();


