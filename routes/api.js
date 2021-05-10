var express = require('express');
var router = express.Router();
// var uwApi = require('../UW_API');
/* GET users listing. */

router.get('/course/:courseName', function(req, res, next) {
  uwApi.getCourse("1211",req.params["courseName"])
  .then((r) => res.send(r.data[0]))
  .catch((err)=>console.log(err));
});

router.get('/prereq/:courseName', function(req, res, next) {

  uwApi.getCourse("1211",req.params["courseName"])
  .then((r) => res.send(r.data[0]["requirementsDescription"]))
  .catch((err)=>console.log(err));
});


router.get('/course/description/:courseName', (req,res, next)=>{
  uwApi.getCourse("1211", req.params["courseName"])
  .then((r)=> res.send(r.data[0]["description"]))
  .catch((err)=> console.log(err));
});


module.exports = router;
