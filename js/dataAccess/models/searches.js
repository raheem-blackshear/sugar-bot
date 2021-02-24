'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let DBAccess = require('../dbaccess');
let conn = new DBAccess().getConnection();
let Int32 = require('mongoose-int32');

let schema = new Schema({
    userId: {type: Schema.Types.ObjectId, required: true},
    searchBody: {type: Schema.Types.Mixed, required: true},
    resultCount: {type: Int32, required: true},
    createdDate: {type: Date, required: true, default: new Date().toUTCString()},
    updatedDate: {type: Date, required: true, default: new Date().toUTCString()},

});

let Search = conn.model('search',schema);

module.exports = Search;
