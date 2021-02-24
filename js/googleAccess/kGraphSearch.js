'use strict';
let google = require('googleapis');
const API_KEY = 'AIzaSyAPJyw5foL-SUpXHyfcWCy8tuhh-YV8R0s';
const Promises = require('bluebird');
let kgraph;

class KGraphSearch {
    constructor(){
        kgraph = google.kgsearch('v1');

    }

    search(query) {
        return new Promise((resolve, reject) => {
            kgraph.entities.search({
                key: API_KEY,
                query: query,
                limit: 10,
                indent: true
            }, function (err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
}


module.exports = KGraphSearch;