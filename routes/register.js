'use strict';

let stripeConfig = require('../stripe.json');
//
if (process.env.NODE_ENV === 'development') {
    stripeConfig = require('../stripe-prod.json');
}

let express = require('express');
let router = express.Router();
let passport = require('passport');
let Users = require('../js/dataAccess/models/users');
let Crypto = require('../js/crypto');
let MailService = require('../js/mailService');
const stripeKey = stripeConfig.secretKey;
let stripe      = require("stripe")(stripeKey);

router.post('/',function(req,res) {
    if (req.body &&
    req.body.termsOfService &&
    req.body.emailAddress &&
    req.body.password && req.body.state) {
      stripe.customers.create(
        {
          email: req.body.emailAddress
        },
        function(err, customer) {
          let one = new Users();
          one.emailAddress = req.body.emailAddress;
          // if(req.body.emailAddress.indexOf('sugarbot.com')>0)
          //     one.role = 'admin';
          one.termsOfService = req.body.termsOfService;
          one.state = req.body.state;
          one.city = req.body.city;
          one.address = req.body.address;
          one.zipcode = req.body.zipcode;
          one.affiliation = req.body.affiliation;
          one.password = new Crypto().encrypt(req.body.password);
          one.stripeId = customer.id;
          one.save().then(saved => {
              if (saved) {
                  let protocol = (req.connection.encrypted) ? "https://" : "http://";
                  let url = protocol + req.headers.host+'/verify/'+saved._id;
                  let ms = new MailService();
                  ms.sendEmail('admin@sugarbottomstudios.com', 'SugarBotAdmin', 'SugarBot Email Verification', 'Please click the following'+
                      'link to verify your email: '+url, [req.body.emailAddress]).then(response =>{
                            res.status(200).send({status: "ok", message: "Saved"})
                  });
              } else {
                  res.status(500).send({status: "error", message: "Not saved"})
              }
          }).catch(err =>{
              res.status(500).send({status: "error", message: "Not saved", model: err})
          })
        }
      );
   } else {
        res.status(400).send("Required parameters not present")
    }

});


module.exports = router;
