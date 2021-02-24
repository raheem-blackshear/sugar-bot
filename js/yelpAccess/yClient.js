'use strict';
/**
 * Created by barre on 7/5/2017.
 */
const Yelp = require('yelp-fusion');
const Promise = require('bluebird');

const clientId = "q-7eFL-JKAqxvGz_0q9doQ";
const clientSecret = "jKp9uiFKWUDIPkPba3VDXFn8yfq2AL0xY4UJclWMQ2oxoGQxAPVodXMFqJ6jmxQVZ7egftoqRJIEG_sigExazXnzd1pED6nplpF9so5eKHGLQVys-J8JnGa0luAfW3Yx";



function YClient() {
}

YClient.prototype.getClient = function() {
    if (YClient) {

        return new Promise(function (resolve,reject) {
					console.log('something2');
            resolve(Yelp.client(YClient));
        });
    }
    else {
      return Yelp(clientId, clientSecret).then(response => {
            YClient = response.jsonBody.access_token;
            let client = Yelp.client(YClient);
            return client;
        }).catch(e => {
            console.log(e);
        });
    }
};


module.exports = YClient;
