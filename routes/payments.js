'use strict';
let express = require('express');
let router = express.Router();
//let Industries = require('../js/dataAccess/models/industries');
let passport = require('passport');
let StripeConnector = require('../js/stripe/stripeConnector');
let RouteUtils = require('./routeUtil');
let Promise = require('bluebird');

let routeUtils = new RouteUtils();
let stripe = new StripeConnector();

router.post('/new/:subscriptionId/:userId',
//    passport.authenticate('basic', {session: false}), // NOTE: Don't enable this for form posts
    function(req, res, next){
        stripe.stripeClient.tokens.create({
            card: {
                number: '4242424242424242',
                exp_month: 12,
                exp_year: 2020,
                cvc: '123'
            }
        }, function(err, token) {
            stripe.createCustomer(req.params.userId, token.id).then(customer => {
                Promise.delay(500).then(() => {
                    console.log(req.params);
                    return stripe.createSubscription(req.params.userId,req.params.subscriptionId).then(sub => {
                        console.log(sub);
                        //return res.redirect("/confectionery");
                        routeUtils.sendOk(res, sub);
                    }).catch(err => {
                        console.log(err);

                        throw err;
                    })
                });
            }).catch(err => {
                console.error(err);
                //res.redirect("/confectionery");
                routeUtils.sendOk(res,{});
            });
        });

        
    }
);

router.get('/remove/:datasourceId',
    passport.authenticate('basic', {session: false}),
    function(req, res, next){
        stripe.deleteSubscription(req.user.id,req.params.datasourceId).then(response => {
            routeUtils.sendOk(res,{});
        }).catch(err => {
            console.error(err);
            routeUtils.sendError(res,err);
        });
    }
);



module.exports = router;