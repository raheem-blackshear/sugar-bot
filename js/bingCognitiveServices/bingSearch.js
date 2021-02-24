'use strict';
let util = require('util'),
    Bing = require('node-bing-api')({accKey:
			'7a28be2781134e6686408aa2b7514e59'}),
    searchBing = util.promisify(Bing.web.bind(Bing));

class BingSearch {
    constructor() {
    }

    search(query) {
        return searchBing(query,{count: 1}).then((response) => {
            let body = JSON.parse(response.body);
            return body.webPages.value[0];
        });
    }
}

module.exports = BingSearch;
