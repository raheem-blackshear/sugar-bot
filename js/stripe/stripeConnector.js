'use strict';

let stripeConfig = require('../../stripe.json');

if (process.env.NODE_ENV === 'development') {
    stripeConfig = require('../../stripe-prod.json');
}

let Users = require('../dataAccess/models/users');
let DataSources = require('../dataAccess/models/dataSources');
let _ = require('lodash');

console.log("Stripe environment : "+process.env.NODE_ENV);


class StripeConnector {
    constructor() {
        this.stripeClient = require('stripe')(stripeConfig.secretKey);
    }

    createCustomer(userId, paymentToken) {
        if (!paymentToken) throw "No payment token provided";
        return Users.findById(userId,{emailAddress: 1}).then(user => {
            if (user.stripeId) {
                return user.stripeId;
            }

            return this.stripeClient.customers.create({
                email: user.emailAddress,
                source: paymentToken
            }).then(customer => {
                user.addStripeId(customer.id).then(success => {
                    return customer.id; // this is the stripe id
                });
            });
        });
    };

    createSubscription(userId, dataSourceId) {
        return DataSources.findById(dataSourceId,{key: 1}).then(ds => {
            return Users.findById(userId).then(user => {
                if (!user) throw ("No user found");
                if (!user.stripeId) throw ("User doesn't have a credit card on file");
                let sub = {customer: user.stripeId,
                    items: [
                        {plan: ds.key}
                    ]};
                return this.stripeClient.subscriptions.create(sub).then(subscription => {
                    return user.addSubscription(dataSourceId, subscription.id);
                }).catch(error => {
                    console.error(error);
                    throw error;
                });
            });
        });
    };

    deleteSubscription(userId, dataSourceId) {
        Users.findById(userId).then(user => {
            if (!user) throw ("No user found");
            if (!user.stripeId) throw ("User doesn't have a stripe account");
            let match = _.find(user.subscriptions, sub => { return sub.id === dataSourceId; });
            this.stripeClient.subscriptions.del(match.stripeSubscriptionId, {at_period_end: true}).then(subscription => {
                return user.removeSubscription(dataSourceId);
            });
        });
    };

}

module.exports = StripeConnector;
