// imported PapaParse in index.html

// season emojis
const fall = "🍁";
const winter = "❄️";
const spring = "🌷";
const question = "❓";

// makeSeasonString(seasonList): makes string of season emojis 
// based on season list
function makeSeasonString(seasonList) {
    let result = "";
    while (seasonList.length != 0) {
        const [car, ...cdr] = seasonList;
        if (car === 'F') {
            result += fall;
        }
        else if (car === 'W') {
            result += winter;
        }
        else if (car === "S") {
            result += spring;
        }
        else {
            result += question;
        }
        seasonList = cdr;
    }
    return result;
}

// console.log(makeSeasonString(['F', 'S']));
// "data" is an array of arrays containing the header / class data

// parseCsvData(data): parses csv data into json object
function parseCsvData(data) {
    // console.log(data);
    let parsedData = {};
    for (var i = 1; i < data.length; i++) {
        let cc = data[i][0];                                        // courseCode
        let cn = data[i][1];                                        // courseName
        let cd = data[i][2];                                        // courseDesc
        let cp = (cc === "HS") ? [] : data[i][3].split(", ");       // coursePrereq
        let cl = data[i][4];                                        // courseLevel
        let cs = (cc === "HS") ? "" : makeSeasonString(data[i][5].split(", "));          // courseSeasons (as a string)
        parsedData[cc] = {
            courseCode: cc,
            courseName: cn,
            courseDescription: cd,
            coursePrereq: cp,
            courseLevel: cl,
            courseSeasons: cs,
        }
    }
    // console.log(parsedData);
    return parsedData;
}

export { parseCsvData };