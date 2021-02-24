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
    key: {type:String, required: true},
    label: {type: String, required: true},
    values: [{
        key: {type: String, required: true },
        label: {type: String, required: true },
        value: {type: String, required: true },
    }]
});

let References = conn.model('reference',schema);

module.exports = References;