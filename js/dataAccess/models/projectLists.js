'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let DBAccess = require('../dbaccess');
let conn = new DBAccess().getConnection();
let Int32 = require('mongoose-int32');
let Float = require('mongoose-float');

let schema = new Schema({
    // _id: {type: mongoose.Types.ObjectId},
    projectId: {type: Schema.Types.ObjectId, ref: 'projects'}, // project._id
    name : {type: String},
    entries: [{
        name: {type: String},
        company: {type: String},
        email: {type: String},
        phone: {type: String},
        website: {type: String},
        address1: {type: String},
        address2: {type: String},
        city: {type: String},
        state: {type: String},
        country: {type: String},
        zipcode: {type: String},
        yelp_url: {type: String},
        crmSynced: {type: Boolean, default: false},
        source: {type: String}
    }],
    active: {type: Boolean, default: true},
    dataSources: [
          {type: String},

        ],
    city: {type: String},
    location: {
      lat: {type: Float},
      lng: {type: Float}
    },
    address: {type: String},
    state: {type: String},
    industry: {type: String},
    subindustry: {type: String},
    subsubindustry : {type: String},
    term : {type: String},
    createdBy: {type: Schema.Types.ObjectId},
    createdDate: {type: Date, default: new Date().toUTCString()},
    updatedDate: {type: Date, default: new Date().toUTCString()}
});

let ProjectLists = conn.model('projectList',schema);

module.exports = ProjectLists;
