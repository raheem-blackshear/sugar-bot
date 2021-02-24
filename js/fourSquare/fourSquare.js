'use strict';
/**
 * Created by barre on 7/5/2017.
 */
const axios  = require('axios');
const delay = require('delay');
const CLIENT_ID = "KSJ0ZQVDUTIPGGSHRUQOAMLJILMBGX2G4PBNZRXR3QFU3N1W";
const CLIENT_SECRET = "FWGK3P5FGV3QRTMJWA5XSFUUJZTLKP5DT5DB1PHBUOGZC303";

class FourSquare {
    constructor() {
    }

    async search(searchCriteria) {
        // searchCriteria.location = searchCriteria.location.slice(0, -2);
        let locationTags = searchCriteria.location;
        let placeIds = [];
        let result = [];
        let keywords = searchCriteria.term.split(',');
        for(var i = 0; i < keywords.length; i++) {
          await axios.get('https://api.foursquare.com/v2/venues/search?client_id='+CLIENT_ID+'&client_secret='+CLIENT_SECRET+'&v=20180323&radius=1609&ll='+locationTags.lat + ',' + locationTags.lng+'&query='+keywords[i]+'&limit=1000')
                  .then(response => {
                      if (response && response.data) {
                          for(var j = 0; j < response.data.response.venues.length; j++)
                            if(locationTags.originalData.indexOf(response.data.response.venues[j].id)<0) {
                                placeIds.push(response.data.response.venues[j]);
                            }

                      }
                  });
        }
        for(var i = 0; i < placeIds.length; i++) {
          // console.log(i + " " + 'https://api.foursquare.com/v2/venues/'+placeIds[i].id+'?client_id='+CLIENT_ID+'&client_secret='+CLIENT_SECRET+'&v=20180323');
          let url = 'https://api.foursquare.com/v2/venues/'+placeIds[i].id+'?client_id='+CLIENT_ID+'&client_secret='+CLIENT_SECRET+'&v=20180323';
          await axios.get(url).then(response => {
            if (response && response.data) {
                let venue = response.data.response.venue;
                result.push(venue);
            }
            else {
                let venue = placeIds[i];
                result.push(venue);
            }
          });
        }
        return result;
    };
}


module.exports = FourSquare;
