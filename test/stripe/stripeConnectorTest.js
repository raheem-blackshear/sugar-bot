'use strict';

let assert = require('assert');
let StripeConnector = require('../../js/stripe/stripeConnector');

describe("StripeConnector",() =>{
    describe("Constructor",() =>{
        it("Works",() =>{
            let connector = new StripeConnector();
            assert.ok(connector);
        });
    });

    describe("Create Customer",() =>{
        it("Works",(done) =>{
            let connector = new StripeConnector();
            connector.createCustomer("5977df0fb1a2d3220851d852").then(id => {
                assert.ok(id);
                done();
            }).catch(err => {
                console.error(err);
                done(err);
            });
        });
    });

    describe("Create a subscription",() =>{
        it("Works",(done) =>{
            let connector = new StripeConnector();
            connector.createSubscription("5977df0fb1a2d3220851d852","59c1386f1b0ce92b2c467360").then(id => {
                assert.ok(id);
                done();
            }).catch(err => {
                console.error(err);
                done(err);
            });
        });
    });


});