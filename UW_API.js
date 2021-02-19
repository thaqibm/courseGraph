const config = require("./config")
const URL = "https://openapi.data.uwaterloo.ca/v3";
const axios = require('axios');
const { isNumber } = require("util");
const { resolve } = require("path");
const { rejects } = require("assert");

axios.get(URL+'/subjects',{headers: {"X-API-KEY" : config.APIKEY}})
  .then(response => {
    //console.log(response.data);
  })
  .catch(error => {
    console.log(error);
  });


const splitNameNum = (str)=>{
	var sub = '';
	var code = '';
    for(var i = 0; i<str.length; i++){
        if(isNaN(str[i])){
            sub += str[i];
        }
        else{
            code+=str[i];
        }
    }
	return [sub,code];
}

const getCourse = (termcode,name) =>{
		const x = splitNameNum(name);
    	return axios.get(URL + "/Courses/" + termcode +'/'+x[0] +'/' + x[1], {headers: {"X-API-KEY" : config.APIKEY}});
}

// export { getCourse };
module.exports = {getCourse :getCourse}