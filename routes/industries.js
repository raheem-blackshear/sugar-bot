'use strict';
/**
 * Created by barre on 7/16/2017.
 */

const consumerSecret = "En9LGzRCJ15cPw7y";
const consumerKey = "3gtA6YYYXgtwe3nVDfPA21Tc7A6rFCeF";
const axios  = require('axios');

let express = require('express');
let router = express.Router();
let Industries = require('../js/dataAccess/models/industries');
let passport = require('passport');


router.get('/all',
    passport.authenticate('basic', {session: false}), function(req, res, next){
    Industries.find().then(results => {
        res.json(results);
    });
});

router.get('/',
    passport.authenticate('basic', {session: false}), function(req, res, next){
      let basicToken = consumerKey+":"+consumerSecret;
      let accessToken = '';
      axios.post('https://plus.dnb.com/v2/token', { "grant_type" : "client_credentials" }, {
          headers: {
            "Authorization": "Basic " + Buffer.from(basicToken).toString('base64'),
            "Content-Type": "application/json"
          }
      })
      .then(function (response) {
          accessToken = response.data.access_token;
          axios.get('https://plus.dnb.com/v1/referenceData/category?id=3599', {
              headers: {
                "Authorization": "Bearer " + accessToken,
                "Content-Type": "application/json"
              }
          }).then(function(data) {
              let codes = [];
              // console.log(data.data.codeTables[0].codeLists.length);
              for(var i = 0; i < data.data.codeTables[0].codeLists.length; i++)
                codes.push({code: data.data.codeTables[0].codeLists[i].code, description:data.data.codeTables[0].codeLists[i].description});
              Industries.collection.insert(codes, function (err, docs) {
                if (err){
                    res.json(err);
                } else {
                    res.json(docs);
                }
              });
              // console.log(data.codeTables.length);
              // console.log(data.codeTables[0]]);
              // Industries.collection.insert(codes).then(results => {
              //     console.log(results);
              //     res.json(results);
              // });
          })
      })
      .catch(function (error) {
        console.log(error);
      });
});

module.exports = router;
