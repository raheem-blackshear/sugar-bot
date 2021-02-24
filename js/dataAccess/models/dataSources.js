'use strict';
/**
 * Created by barre on 7/16/2017.
 */

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let DBAccess = require('../dbaccess');
let conn = new DBAccess().getConnection();
let Int32 = require('mongoose-int32');

let schema = new Schema({
    // _id: {type: mongoose.Types.ObjectId},
    dataSource: {type: String, required: true},
    keyword: {type: String, required: true},
    location: {type: String, required: true},
    records: [{
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
    }]
});

schema.statics.recommended = function() {
    return this.find({isRecommended: true})
};

let DataSource = conn.model('dataSource',schema);



module.exports = DataSource;
