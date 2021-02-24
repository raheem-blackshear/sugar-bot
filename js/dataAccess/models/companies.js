'use strict';
/**
 * Created by barre on 7/5/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var DBAccess = require('../dbaccess');
var conn = new DBAccess().getConnection();
var Int32 = require('mongoose-int32');

var schema = new Schema({
    name: {type:String, required: true},
    yelpId: {type: String},
    address: {},
    yelpBody: {},
    yelpBusinessBody: {}
});

var Companies = conn.model('company',schema);

module.exports = Companies;
