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
    code: {type:String, required: true},
    description: {type: String, required: true}
});

let Industries = conn.model('industry',schema);

module.exports = Industries;
