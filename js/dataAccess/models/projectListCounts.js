'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let DBAccess = require('../dbaccess');
let conn = new DBAccess().getConnection();

let schema = new Schema({
});

let ProjectListsCounts = conn.model('projectlist_counts',schema);

module.exports = ProjectListsCounts;