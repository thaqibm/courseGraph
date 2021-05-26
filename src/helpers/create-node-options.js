// Creates JSON with key = subject code, and element = object
// containing the "options" for the nodes corresponding to said code

// code is to be run manually when needed

const axios = require('axios');
const fs = require('fs');
const { isContext } = require('vm');
const config = require('../config');

const URL = "https://openapi.data.uwaterloo.ca/v3";

// get list of academic organizations
async function getListAcadOrgs() {
    return axios.get(`${URL}/AcademicOrganizations`, { headers: { "X-API-KEY": config.APIKEY } });
}

// imported getSubjectList from get-course-data.js
async function getSubjectList() {
    return axios.get(`${URL}/subjects`, { headers: { "X-API-KEY": config.APIKEY } });
}

// hsv to rgb color converter
// code modified from https://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
// hsv values from 0 < x < 1
function hsv_to_rgb(h, s, v) {
    let h_i = parseInt(h * 6);
    let f = h * 6 - h_i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);

    const dict = {
        0: [v, t, p],
        1: [q, v, p],
        2: [p, v, t],
        3: [p, q, v],
        4: [t, p, v],
        5: [v, p, q],
    };
    const [r, g, b] = dict[h_i];

    return [parseInt((r * 256), 10), parseInt((g * 256), 10), parseInt((b * 256), 10)];
}

// custom function to make random number between 0 and 1
function make_random_number() {
    const phirec = (Math.sqrt(5) - 1) / 2;
    return (Math.random() + phirec) % 1;
}

// make random color (returned as a string #RrGgBb), given
// saturation and value (both in the range of 0..1)
// code modified from same source as hsv_to_rgb
function make_random_color(rnum, saturation, value) {
    // get rgb values as hexadecimals
    const [r, g, b] = hsv_to_rgb(rnum, saturation, value)
        // convert to two-digit hexadecimal
        .map((num) => num.toString(16).padStart(2, "0"));
    // return rgb string
    return `#${r}${g}${b}`;
}

// make node config for generic node
function makeBasicNodeConfig() {
    const basicNodeConfig = {
        labelHighLightBold: true,
        borderWidth: 1.5,
        font: {
            face: 'Lato',
            size: 16,
            multi: 'html',
        },
        nodes: {
    
        },
        shapeProperties: {
            borderRadius: 2.5,
        },
        shape: 'dot',
        size: 15,
    };
    fs.writeFileSync(
        "src/config/basicNodeConfig.json",
        JSON.stringify(basicNodeConfig)
    );
    console.log("JSON config file for generic node created");
}

// make node config for acad organizations
function makeListAcadOrgsConfig() {
    getListAcadOrgs().then((result) => {

        // const csvData = result.data.map((org) => [org.code, org.name, "f111", "circle"].join(",")).join("\n");
        // initialize config options for acad orgs
        const acadOrgs = result.data.map((org) => org.code);
        const acadOrgsConfig = {};
    
        // manually insert the symbol I want to represent the
        // academic organization
        const symbolCodeDict = {
            ACC: "f1ec",        // calculator
            AHS: "f479",        // first-aid
            AHSDEAN: "f479",    // first-aid
            CS: "f109",         // desktop
            MAT: "f52c",        // equals
            MATHDEAN: "f52c",   // equals
        }
    
        for (let i in result.data) {
            acadOrgsConfig[result.data[i].code] = {
                name: result.data[i].name,
                symbolcode: "f111",
                symbolname: "circle",
            };
        }
    
        // write config object to json file
        fs.writeFileSync(
            "src/config/academicOrganizationsConfig.json",
            JSON.stringify(acadOrgsConfig),
        );
        console.log("JSON config file for academic organizations created");
    })
}

// make config for subject codes
function makeSubjectCodesConfig() {
    getSubjectList().then((result) => {

        const subjectCodes = result.data.map((subject) => subject.code);
    
        // initialize config json for subject codes
        const subjectCodesConfig = {};
    
        // make config options for each subject code
        for (let i in subjectCodes) {
            // make (custom) random number (for color)
            let rnum = make_random_number();
            // add node config options for subject code
            subjectCodesConfig[subjectCodes[i]] = {
                color: {
                    background: make_random_color(rnum, 0.99, 0.7),
                    border: 'black',
                    highlight: {
                        background: make_random_color(rnum, 0.5, 0.9),
                        border: 'black',
                    },
                },
            };
        }
    
        // write config object to json file
        fs.writeFileSync(
            "src/config/subjectCodesConfig.json",
            JSON.stringify(subjectCodesConfig)
        );
        console.log("JSON config file for subject codes created");
    
    });   
}