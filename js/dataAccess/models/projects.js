'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let DBAccess = require('../dbaccess');
let conn = new DBAccess().getConnection();
let Int32 = require('mongoose-int32');

let schema = new Schema({
    // _id: {type: Schema.Types.ObjectId, required: true},
    name: {type: String},
    createdBy: {type: Schema.Types.ObjectId, ref: 'user'},
    createdDate: {type: Date, default: new Date().toUTCString()},
    updatedDate: {type: Date, default: new Date().toUTCString()},
    hasSubscriptions : {type:Boolean}

});

schema.methods.addDataSource = function(dataSourceId) {
    let match = _.find(this.dataSources, ds => { return ds == dataSourceId; });
    if (match) {
        return new Promise(function(resolve,reject) {
            resolve({status: "ok", message: "User already has dataSource"});
        });
    }
    this.dataSources.push(dataSourceId);
    return this.save();
};

schema.methods.removeDataSource = function(dataSourceId) {
    _.remove(this.dataSources, ds => {
        return ds == dataSourceId;
    });
    return this.save();
};

let Project = conn.model('project',schema);

module.exports = Project;
