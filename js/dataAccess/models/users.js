'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let DBAccess = require('../dbaccess');
let conn = new DBAccess().getConnection();
let Int32 = require('mongoose-int32');
let Float = require('mongoose-float');
let Promise = require('bluebird');
let Crypto = require('../../crypto');
let _ = require('lodash');

let schema = new Schema({
    emailAddress: {type:String, required: true},
    fullName: {type:String, required: false},
    state: {type:String, required: true},
    city: {type:String, required: false},
    zipcode: {type:String, required: false},
    address: {type:String, required: false},
    company: {type:String, required: false},
    affiliation: {type:String, required: true},
    logo: {type: String, required: false},
    password: {type: String, required: true},
    phoneNumber: {type:String, required: false},
    active: {type: Boolean, required: true, default: false},
    credit: [{
      amount: {type: Float, required: true, default: 0.0},
      description: {type: String, required: true},
      updatedDate: {type: Date, required: true, default: new Date().toUTCString()}
    }],
    purchasedListIds: [{type: String}],
    role: {type: String, required: true, default: 'user'},
    termsOfService: {type: Boolean, required: true, default: false},
    dateOfBirth: {type: Date, required: false},
    createdDate: {type: Date, required: true, default: new Date().toUTCString()},
    updatedDate: {type: Date, required: true, default: new Date().toUTCString()},
    coupons: [{
        id: {type: String},
        name: {type: String},
        usedDate: {type: Date, default: new Date().toUTCString()},
    }],
    billingInformation: {
        address1: {type:String},
        address2: {type:String},
        city: {type:String},
        state: {type:String},
        zip: {type:String}
    },
    integrations: {
        pardot: {
            email: {type: String},
            userKey: {type: String},
            password: {type: String}
        }
    },
    stripeId: {type:String},
    verified: {default: false},
    closed: {default: false}
});

schema.statics.verifyUserPassword = function(emailAddress, password) {
    let self = this;
    return new Promise(function(resolve, reject){
        if (emailAddress === undefined ||
            password === undefined ||
            emailAddress === null ||
            password === null || state === null) resolve(false);
        let crypto = new Crypto();
        let encryptoed = crypto.encrypt(password);
        self.findOne({emailAddress : emailAddress}).select({password: 1}).exec(function(err,doc){
            if (err) resolve(false);
            if (doc === undefined) resolve(false);
            resolve(doc.password === encryptoed);
        });
    });
};

schema.methods.verifyThisUsersPassword = function(toTest) {
    let encrypted = new Crypto().encrypt(toTest);
    return this.password === encrypted;
};

schema.methods.addSubscription = function(dataSourceId, stripeSubscriptionId) {
    let match = _.find(this.subscriptions, sub => { return sub.id === dataSourceId; });
    if (match) {
        return new Promise(function(resolve,reject) {
            resolve({status: "ok", message: "User already has dataSource"});
        });
    }

   this.subscriptions.push({id: dataSourceId, subscribedDate: new Date().toUTCString(), active: true,stripeSubscriptionId : stripeSubscriptionId });
   return this.save();
};

schema.methods.removeSubscription = function(dataSourceId) {
    _.remove(this.subscriptions, sub => {
       return sub.id === dataSourceId;
    });
    return this.save();
};

schema.methods.addStripeId = function(stripeId)  {
    this.stripeId = stripeId;
    return this.save();
};


let User = conn.model('user',schema);

module.exports = User;
