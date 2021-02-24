'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let DBAccess = require('../dbaccess');
let conn = new DBAccess().getConnection();
let Int32 = require('mongoose-int32');

let schema = new Schema({
    // _id: {type: mongoose.Types.ObjectId},
    projectId: {type: Schema.Types.ObjectId, ref: 'projects'}, // project._id
    name : {type: String},
    sender: {type: String},
    subject: {type: String},
    html: {type: String},
    datetime: {type: Date },
    active: {type: Boolean, required: true, default: false},
    createdBy: {type: Schema.Types.ObjectId},
    createdDate: {type: Date, default: new Date().toUTCString()},
    updatedDate: {type: Date, default: new Date().toUTCString()}
});

let Template = conn.model('template',schema);

module.exports = Template;
