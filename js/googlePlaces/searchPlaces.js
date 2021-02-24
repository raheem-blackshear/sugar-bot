'use strict';
/**
 * Created by barre on 7/5/2017.
 */
const apiKey = "AIzaSyC5Gm3PzDQv5o8qDzze8D_jHFwgNgmC_PA"
//AIzaSyC5Gm3PzDQv5o8qDzze8D_jHFwgNgmC_PA
const axios  = require('axios');
const delay = require('delay');

class SearchPlaces {
    constructor() {
    }

    async search(searchCriteria) {
        // searchCriteria.location = searchCriteria.location.slice(0, -2);
        let locationTags = searchCriteria.location;
        let placeIds = [];
        let result = [];
        let keywords = searchCriteria.term.split(','), apiCallCount=0;

        for(var i = 0; i < keywords.length; i++) {
          let pagetoken = "first", count = 0;
          while(pagetoken != null) {
            let url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + locationTags.lat + ',' + locationTags.lng + '&radius=1609&keyword=' + keywords[i] + '&key='+apiKey;
            url = (pagetoken=="first") ? url : 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=' + pagetoken + '&key='+apiKey;
            await axios.get(url)
                    .then(response => {
                        if (response && response.data) {
                            pagetoken = response.data.next_page_token ? response.data.next_page_token : null;
                            for(var k = 0; k < response.data.results.length; k++) {
                              if(locationTags.originalData.indexOf(response.data.results[k].place_id)<0) {
                                count++;
                                placeIds.push(response.data.results[k].place_id);
                              }
                            }
                        }
                    });
            if(pagetoken != null && pagetoken != "first")
              await delay(2000);
          }
        }
        for(var i = 0; i < placeIds.length; i++) {
          let url = 'https://maps.googleapis.com/maps/api/place/details/json?place_id='+placeIds[i]+'&fields=name,url,geometry,types,address_components,formatted_phone_number&key='+apiKey;
          await axios.get(url).then(response => {
            if (response && response.data) {
                if(response.data.result) {
                  let data = response.data.result;
                  data.id = placeIds[i];
                  result.push(data);
                }
            }
          });
        }
        return result;
    };
}


module.exports = SearchPlaces;
