'use strict';
/**
 * Created by barre on 7/16/2017.
 */

let stripeConfig = require('../stripe.json');
//
if (process.env.NODE_ENV === 'development') {
    stripeConfig = require('../stripe-prod.json');
}

let express     = require('express');
let router      = express.Router();
let axios       = require('axios');
let passport    = require('passport');
let DataSources = require('../js/dataAccess/models/dataSources');
let Users       = require('../js/dataAccess/models/users');
let _           = require('lodash');
const stripeKey = stripeConfig.secretKey;
let stripe      = require("stripe")(stripeKey);

router.get('/getDataSource/:dataSourceId',
    passport.authenticate('basic', {session: false}), function (req, res, next) {
        if (!req.params.dataSourceId) {
            res.status(400).send({status: "Bad Request", message: "No model or id provided."});
            next();
        }

        let dataSourceId = req.params.dataSourceId;

        DataSources.find({_id: dataSourceId}).then(resp => {
            res.status(200).send({status: "ok", response: resp[0].label});
        });
    }
);

router.get('/',
    passport.authenticate('basic', {session: false}),
    function(req, res, next){
        let retval = [];
        let result = [];

        Promise.resolve()
        .then(function(retval){
            return new Promise(function(resolve, reject) {
                stripe.products.list(
                    {limit: 100},
                    (err, products) => {
                        retval = products.data;
                        retval.forEach(item => {
                            result.push({
                                title: item.name,
                                description: item.metadata.description,
                                id: item.id,
                                logos: item.metadata.logo
                            })
                        });
                        resolve(result);
                    }
                );
            });
        })
        .then(function(retval){
            return new Promise(function(resolve, reject) {
                stripe.plans.list(
                    {limit: 100},
                    function(err, plans) {
                        plans = plans.data;
                        plans.forEach(pln => {
                            retval.forEach(item => {
                                if (pln.product == item.id) {
                                    item.price = pln.amount;
                                    item.plan = pln;
                                    item.subscribed = false;
                                    item.active     = true;                                    
                                }
                            });
                        });
                        resolve(retval);
                    }
                );
            });
        })
        .then(function(retval){
            let options = {
                headers: {'Authorization': 'Bearer ' + stripeKey}
            };
            axios.get('https://api.stripe.com/v1/tax_rates', options)
            .then(response => {
                if (response.data.data.length > 0) {
                    let tax_percent = response.data.data[0].percentage;

                    retval.forEach(item => {
                        item.taxpercent = tax_percent;
                        item.price      = item.price / 100;
                    });
                }

                return res.status(200).send({status: "ok", response: retval});
            });
        });
    });

module.exports = router;
