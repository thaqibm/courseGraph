const config = require("./config")
const URL = "https://openapi.data.uwaterloo.ca/v3";
const axios = require('axios');



axios.get(URL+'/subjects',{headers: {"X-API-KEY" : config.APIKEY}})
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.log(error);
  });