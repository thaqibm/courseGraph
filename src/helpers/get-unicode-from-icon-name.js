// Get unicode from icon name helper function
// used by "create-node-options.js"

const axios = require('axios');
const jsdom = require('jsdom');

const URL = "https://fontawesome.com/v5/cheatsheet/free/solid";

axios.get(URL).then((result) => {
    const dom = new jsdom.JSDOM(result.data);

})