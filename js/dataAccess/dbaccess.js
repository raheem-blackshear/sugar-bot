'use strict';
/**
 * Created by barre on 7/5/2017.
 */
let mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

let dbconfig = require('../../mongo.json');

if (process.env.NODE_ENV === 'production') {
    dbconfig = require('../../mongo-prod.json');
}

if (process.env.NODE_ENV === 'stage') {
    dbconfig = require('../../mongo-stage.json');
}

if (process.env.NODE_ENV === 'development') {
    dbconfig = require('../../mongo-stage.json');
}


if (process.env.NODE_ENV === 'ci') {
    dbconfig = require('../../mongo-ci.json');
}


console.log("Process env NODE_ENV : "+process.env.NODE_ENV);

function DBAccess() {
    this.connectionString = dbconfig.connectionString;
    if (DBAccess.connection === undefined) {
        let options = { promiseLibrary: require('bluebird') };
        if (dbconfig.pass && dbconfig.user) {
            options.user = dbconfig.user;
            options.pass = dbconfig.pass;
        }

        DBAccess.connection = mongoose.connect(this.connectionString,options);
    }
}

DBAccess.prototype.getConnection = function(){
    return DBAccess.connection;
};

module.exports = DBAccess;
