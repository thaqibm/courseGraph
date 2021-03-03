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

let throttle = throttledQueue(1, 10000);

// getCourse(courseCode): returns promise containing data of course with courseCode
async function getCourse(courseCode) {
    return axios.get("https://course-graph.herokuapp.com/api/course/" + courseCode);
}

// getCourseDoCommand(courseCode): returns the promise formed by
// (axios) getting the courseCode from the API, then
// command is a *function* that we pass in, which takes in the json "result",
// and does something
async function getCourseDoCommand(courseCode, command) {
    getCourse(courseCode)
        .then(function (result) {
            command(result);
        })
        .catch(function (error) {
            throw ("error in retrieving course");
        });

}

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

// sleep(ms): "waits" for the number of milliseconds specified by ms
// usage: "await sleep(N)", where N is an nat number
// waits for N milliseconds
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// makeSqlCommand(subject, LB, UB): makes "insert" SQL command for the
// subject "subject", with 'number' bounds LB and UB
// it then passes that SQL command into the "connect" function, inserting the
// relevant data into the database
async function makeSqlCommandAndInsert(subjectList, LB, UB) {
    let sqlcommand = "INSERT INTO my_class_data VALUES ";
    async function helper() {
        let promises = [];
        for (let j in subjectList) {
            for (let i = LB; i < UB; i++) {
                // throttle(function() {
                promises.push(getCourse(`${subjectList[j]}${i}`));
                // });
                // promises.push(getCourse(`${subjectList[j]}${i}`));
            }
            console.log(`Added all courses from ${subjectList[j]}`);
        }
        // console.log(`Added all courses`)
        // console.log(promises);
        return Promise.all(promises);
    }
    helper().then(lst => {
        console.log("Making the SQL command...")
        let validlst = [];
        for (let c in lst) {
            if (!(lst[c].data === '')) {
                validlst.push(lst[c]);
            }
        }
        for (let c in validlst) {
            let pcd = parseClassData(validlst[c]);
            if (pcd) {
                // console.log(pcd.courseDescription);
                // an "&" sign is used in place of any double quotes
                // this can be "translated" back later if the description needs
                // to be shown
                if (c == validlst.length - 1) {
                    sqlcommand += `(${pcd.courseId}, "${pcd.courseCode}", "${pcd.courseName.replace(/["]+/g, '&')}", "${pcd.courseDescription.replace(/["]+/g, '&')}")`;
                }
                else {
                    sqlcommand += `(${pcd.courseId}, "${pcd.courseCode}", "${pcd.courseName.replace(/["]+/g, '&')}", "${pcd.courseDescription.replace(/["]+/g, '&')}"), `;
                }

            }
        }
        if (validlst.length != 0) {
            connect(sqlcommand);
        }
        else {
            console.log("Skipped course, since no valid courses with the subject")
        }

    }).catch(function (err) {
        console.log(`ERROR: ${err}`);
    })
}

// connect(sql): takes in a sql command sql, performs said command
// on the my_class_data table
function connect(sql) {
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "XXXXXX", // my localhost pw would go here
        database: "class_data",
    });
    console.log("SQL command has been made, now querying the server: ");

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

// const courseSubjectList = ['AFM', 'ACTSC', 'ASL', 'ANTH', 'AHS', 'APPLS', 'AMATH', 'ARABIC', 'AE', 'ARCH', 'ARTS', 'ARBUS', 'AVIA', 'BIOL', 'BME', 'BASE', 'BUS', 'BET', 'CDNST', 'CHE', 'CHEM', 'CHINA', 'CMW', 'CIVE', 'CLAS', 'COGSCI', 'CO', 'COMM', 'CS', 'CFM', 'COOP', 'CROAT', 'CI', 'DAC', 'DUTCH', 'EARTH', 'EASIA', 'ECON', 'ECE'];
// const courseSubjectList = ['AFM', 'ACTSC', 'ASL', 'ANTH', 'AHS', 'APPLS', 'AMATH', 'ARABIC', 'AE', 'ARCH', 'ARTS', 'ARBUS', 'AVIA', 'BIOL', 'BME', 'BASE', 'BUS', 'BET', 'CDNST', 'CHE', 'CHEM', 'CHINA', 'CMW', 'CIVE', 'CLAS', 'COGSCI', 'CO', 'COMM', 'CS', 'CFM', 'COOP', 'CROAT', 'CI', 'DAC', 'DUTCH', 'EARTH', 'EASIA', 'ECON', 'ECE', 'ENGL', 'EMLS', 'ENBUS', 'ERS', 'ENVE', 'ENVS', 'FINE', 'FR', 'GSJ', 'GENE', 'GEOG', 'GEOE', 'GER', 'GERON', 'GBDA', 'GRK', 'GLTH', 'HIST', 'HRM', 'HRTS', 'HUMSC', 'INDENT', 'INDG', 'INDEV', 'INTST', 'ITAL', 'ITALST', 'JAPAN', 'JS', 'KIN', 'INTEG', 'KOREA', 'LAT', 'LS', 'MGMT', 'MSCI', 'MNS', 'MATBUS', 'MATH', 'MTHEL', 'ME', 'MTE', 'MEDVL', 'MENN', 'MOHAWK', 'MUSIC', 'NE', 'OPTOM', 'PACS', 'PHARM', 'PHIL', 'PHYS', 'PLAN', 'PSCI', 'PORT', 'PD', 'PDARCH', 'PDPHRM', 'PSYCH', 'PMATH', 'REC', 'RS', 'RUSS', 'REES', 'SCI', 'SCBUS', 'SMF', 'SDS', 'SVENT', 'SOCWK', 'SWREN', 'STV', 'SOC', 'SE', 'SPAN', 'SPCOM', 'STAT', 'SI', 'SYDE', 'THPERF', 'UNIV', 'VCULT', 'WKRPT'];
const courseSubjectList = ['ENGL', 'EMLS', 'ENBUS', 'ERS', 'ENVE', 'ENVS', 'FINE', 'FR', 'GSJ', 'GENE', 'GEOG', 'GEOE', 'GER', 'GERON', 'GBDA', 'GRK', 'GLTH', 'HIST', 'HRM', 'HRTS', 'HUMSC', 'INDENT', 'INDG', 'INDEV', 'INTST', 'ITAL', 'ITALST', 'JAPAN', 'JS', 'KIN', 'INTEG', 'KOREA', 'LAT', 'LS', 'MGMT', 'MSCI', 'MNS', 'MATBUS', 'MATH', 'MTHEL', 'ME', 'MTE', 'MEDVL', 'MENN', 'MOHAWK', 'MUSIC', 'NE', 'OPTOM', 'PACS', 'PHARM', 'PHIL', 'PHYS', 'PLAN', 'PSCI', 'PORT', 'PD', 'PDARCH', 'PDPHRM', 'PSYCH', 'PMATH', 'REC', 'RS', 'RUSS', 'REES', 'SCI', 'SCBUS', 'SMF', 'SDS', 'SVENT', 'SOCWK', 'SWREN', 'STV', 'SOC', 'SE', 'SPAN', 'SPCOM', 'STAT', 'SI', 'SYDE', 'THPERF', 'UNIV', 'VCULT', 'WKRPT'];


// main(): adds all the courses from the course at
// courseSubjectList[startIndex]
async function main(startIndex) {
    makeSqlCommandAndInsert([courseSubjectList[startIndex]], 0, 600);
}

// run code; throttle controls the rate at which main runs so
// the server is not overloaded
for (let i in courseSubjectList) {
    throttle(function() {
        main(i);
    })
}



