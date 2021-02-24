'use strict';
/**
 * Created by barre on 7/16/2017.
 */
let express = require('express');
let passport = require('passport');
let router = express.Router();
let Templates = require('../js/dataAccess/models/templates');
let MailService = require('../js/mailService');
const axios  = require('axios');
const lobApiKey = "test_240e53ea4dac0cb2dcaf465965fe5a31536";
// Secret API Keys: test_240e53ea4dac0cb2dcaf465965fe5a31536
// Publishable API Keys: test_pub_3044db4f499e7a6f22ac1e1e5615b10

router.use((req, res, next) => {
    next();
});

router.get('/',
    passport.authenticate('basic', {session: false}), function (req, res, next) {
        Templates.find({createdBy: req.user._id}).lean().then(results => {
            res.status(200).send({status: "ok", response: results});
        }).catch(err => {
            res.status(500).send({status: "error", response: err, message: "Unable to find templates for user"});
        });
    }
);

router.post('/',
    passport.authenticate('basic', {session: false}), function (req, res, next) {
        if (!req.body || !req.body.name) {
            res.status(400).send({status: "Bad Request", message: "No model provided."});
            next();
        }

        Templates.findOne({createdBy: req.user.id, name: req.body.name}).then(template => {
            if (template) {
                res.status(200).send({
                    status: "ok",
                    response: template,
                    message: "Template already exists..."
                });
            } else {
                let one = new Templates();
                one.name = req.body.name;
                one.datetime = req.body.datetime;
                one.subject = req.body.subject;
                one.projectId = req.body.projectId;
                one.htmlContent = req.body.htmlContent;
                one.sender = req.body.sender;
                one.createdDate = one.updatedDate = new Date().toUTCString();
                one.createdBy = req.user._id;
                one.save().then(saved => {
                    res.status(200).send({status: "ok", response: saved, message: "Template saved."});
                }).catch(err => {
                    res.status(500).send({status: "error", response: err, message: "Unable to save template for user."});
                });
            }
        });
    }
);

router.post('/update/:id',
    passport.authenticate('basic', {session: false}), function (req, res, next) {
        if (!req.body || !req.params.id) {
            res.status(400).send({status: "Bad Request", message: "No model or id provided."});
            next();
        }
        let one = new Templates(req.body);
        one.updatedDate = new Date().toUTCString();
        one._id = req.params.id;

        Templates.updateOne({_id: req.params.id}, one).then(saved => {
            res.status(200).send({status: "ok", response: saved, message: "Template updated."});
        }).catch(err => {
            res.status(500).send({status: "error", response: err, message: "Unable to update template for user."});
        });
    }
);

router.post('/send',
    passport.authenticate('basic', {session: false}), function (req, res, next) {
        let ms = new MailService();
        ms.sendEmailBlaster(req.user.emailAddress, req.user.company?req.user.company:req.user.fullName, req.body.template.subject, req.body.template.html, req.body.recipients).then(response =>{
            res.status(200).send({status: "ok", message: "Saved"})
        });
        // ms.sendEmailBlaster(  req.body.template.html, req.body.recipients).then(response =>{
        //     res.status(200).send({status: "ok", message: "Saved"})
        // }).catch(err => {
        //     console.log(err);
        // });
    }
);

router.post('/preview',
    passport.authenticate('basic', {session: false}), function (req, res, next) {
        if (!req.body.template) {
            res.status(400).send({status: "Bad Request", message: "No html content provided."});
            next();
        }
        axios.post('https://api.lob.com/v1/templates', {
          html: req.body.template
        }, {
          header: {
            'Authorization': 'Basic ' + Buffer.from(lobApiKey+":").toString('base64'),
            //'Authorization': 'Basic dGVzdF8yNDBlNTNlYTRkYWMwY2IyZGNhZjQ2NTk2NWZlNWEzMTUzNjo='
          }
        })
        .then(function (response) {
          res.status(200).send({status: "ok", response: response});
        })
        .catch(function (error) {
          console.log(error);
        });
    }
);

module.exports = router;
