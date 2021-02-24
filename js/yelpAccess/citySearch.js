'use strict';
/**
 * Created by barre on 7/5/2017.
 */
const yelp = require('yelp-fusion');

// const clientId = "q-7eFL-JKAqxvGz_0q9doQ";
// const apiKey = "jKp9uiFKWUDIPkPba3VDXFn8yfq2AL0xY4UJclWMQ2oxoGQxAPVodXMFqJ6jmxQVZ7egftoqRJIEG_sigExazXnzd1pED6nplpF9so5eKHGLQVys-J8JnGa0luAfW3Yx"


const clientId = "NzHJmSVI2WDj9TE2K6shpA";
const apiKey = "DpfxmUS3h5iVpK5rxjsXxV1r1dOq7qfQK56KEwYu5jim6p5PrlqaHa5G_ze_JIQEOxgmvmr4OH2WoMqt3CpIv62BFo5E-Wl1StgGj5tEbfwdylhFmkm2ZYGWc6DQXXYx";

class CitySearch {
    constructor() {
    }

    search(searchCriteria) {
        let client = yelp.client(apiKey);
        return client.search({
          term: searchCriteria.term,
          latitude: searchCriteria.location.lat,
          longitude: searchCriteria.location.lng,
          radius: 1609
        }).then(res => {
            let businesses = res.jsonBody.businesses;
            let result = [];
            for(var i = 0; i < businesses.length; i++)
              if(searchCriteria.location.originalData.indexOf(businesses[i].id) < 0)
                result.push(businesses[i]);
            return result;
        });
    };

    getInfoById(yelpId) {
        let client = yelp.client(apiKey);
        return client.business(yelpId).then(function (res) {
            return res.jsonBody;
        });
    }
}


module.exports = CitySearch;
