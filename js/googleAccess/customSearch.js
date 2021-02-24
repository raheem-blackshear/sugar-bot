'use strict';
let agent = require('superagent-bluebird-promise');
const API_KEY = 'AIzaSyAPJyw5foL-SUpXHyfcWCy8tuhh-YV8R0s';
const CX = '005677645193592950288:j1i3czbfrn8';
const url = "https://www.googleapis.com/customsearch/v1?cx="+CX+"&key="+API_KEY+"&q=";

class CustomSearch {
    constructor() {
    }

    search(query) {
        let searchQuery = url+query;
        return agent.get(searchQuery).promise();
    }
}

module.exports = CustomSearch;