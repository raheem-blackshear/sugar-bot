'use strict';
/**
 * Created by barre on 7/5/2017.
 */
const apiKey = "AIzaSyAX1ncLI3aJ8K5tInzJjI1yjvgqllVbg9Y"
const consumerSecret = "En9LGzRCJ15cPw7y";
const consumerKey = "3gtA6YYYXgtwe3nVDfPA21Tc7A6rFCeF";

const axios  = require('axios');
const delay = require('delay');

class SearchDB {
    constructor() {
    }

    async search(searchCriteria, sourceTitle, codes) {
        let basicToken = consumerKey+":"+consumerSecret;
        let location = {
          region: '',
          locality: ''
        };
        let accessToken = '';
        let result = [];
        await axios.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + searchCriteria.location + '&key=AIzaSyAX1ncLI3aJ8K5tInzJjI1yjvgqllVbg9Y')
                .then(response => {
                  
                 
                    if (response && response.data) {
                      console.log('checking the output',response.data)
                        if (response.data.results[0]) {
                            for(var i = 0; i < response.data.results[0].address_components.length; i++) {
                                if(response.data.results[0].address_components[i].types[0] == 'administrative_area_level_1')
                                  location.region = response.data.results[0].address_components[i].long_name;
                                if(response.data.results[0].address_components[i].types[0] == 'locality')
                                  location.locality = response.data.results[0].address_components[i].long_name;
                            }
                        }
                    }
                });
        // await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + locationTags.lat + ',' + locationTags.lng + '&radius=1500&keyword=' + searchCriteria.term + '&key=AIzaSyAX1ncLI3aJ8K5tInzJjI1yjvgqllVbg9Y');

        await axios.post('https://plus.dnb.com/v2/token', { "grant_type" : "client_credentials" }, {
            headers: {
              "Authorization": "Basic " + Buffer.from(basicToken).toString('base64'),
              "Content-Type": "application/json"
            }
        })
        .then(function (response) {
          accessToken = response.data.access_token;
        })
        .catch(function (error) {
          console.log(error);
        });

        let keywords = searchCriteria.term.split(',');
        for(var i = 0; i < keywords.length; i++) {
          let pageNumber = 1, maxPage = 1, url = '', params;
          if(sourceTitle.includes('Criteria')) {
            params = {
              "addressLocality": location.locality,
              "addressRegion": location.region,
              "industryCodes": [{"typeDnbCode": 3599, "description": [keywords[i]]}],
              "pageSize": 50,
              "pageNumber": pageNumber
            };
            await axios.post('https://plus.dnb.com/v1/search/criteria', params, {
                headers: {
                  "Authorization": "Bearer " + accessToken,
                  "Content-Type": "application/json"
                }
            }).then(function(data) {
              for(var k = 0; k < data.data.searchCandidates.length; k++) {
                let record = data.data.searchCandidates[k];
                record.keyword = keywords[i];
                result.push(record);
              }
              if(data.data.candidatesMatchedQuantity > 50) {
                maxPage = Math.ceil(data.data.candidatesMatchedQuantity/50);
                url = 'https://plus.dnb.com/v1/search/criteria';
                // industryCodes = [{"typeDnbCode": 3599, "description": [keywords[i]]}];
              }
            })
          } else if(sourceTitle.includes('Company')) {
            params = {
              "industryCodes": [{"typeDnbCode": 3599, "description": [keywords[i]]}],
              "addressLocality": location.locality,
              "addressRegion": location.region,
              "pageSize": 50,
              "pageNumber": pageNumber
            };
            await axios.post('https://plus.dnb.com/v1/search/companyList', params, {
                headers: {
                  "Authorization": "Bearer " + accessToken,
                  "Content-Type": "application/json"
                }
            }).then(function(data) {
              for(var k = 0; k < data.data.searchCandidates.length; k++) {
                let record = data.data.searchCandidates[k];
                record.keyword = keywords[i];
                result.push(record);
              }
              if(data.data.candidatesMatchedQuantity > 50) {
                maxPage = Math.ceil(data.data.candidatesMatchedQuantity/50);
                url = 'https://plus.dnb.com/v1/search/companyList';
                // industryCodes = [{"typeDnbCode": 3599, "description": [keywords[i]]}];
              }
            })
          } else if(sourceTitle.includes('Contact')) {
            // if(keywords[i].toLowerCase() =='restaurant') keywords[i] += 's';
            params = {
              "searchTerm": keywords[i],
              "addressLocality": location.locality,
              "addressRegion": location.region,
              "pageSize": 50,
              "pageNumber": pageNumber
            }
            await axios.post('https://plus.dnb.com/v1/search/contact', params, {
                headers: {
                  "Authorization": "Bearer " + accessToken,
                  "Content-Type": "application/json"
                }
            }).then(function(data) {
              for(var k = 0; k < data.data.searchCandidates.length; k++) {
                let record = data.data.searchCandidates[k];
                record.keyword = keywords[i];
                result.push(record);
              }
              if(data.data.candidatesMatchedQuantity > 50) {
                maxPage = Math.ceil(data.data.candidatesMatchedQuantity/50);
                url = 'https://plus.dnb.com/v1/search/contact';
                // industryCodes = [{"typeDnbCode": 30832, "description": [keywords[i]]},{"typeDnbCode": 25838, "description": [keywords[i]]}];
              }
            })
          }
          maxPage = maxPage>20?20:maxPage;
          for(var j = 1; j < maxPage; j++) {
            await axios.post(url, params, {
                headers: {
                  "Authorization": "Bearer " + accessToken,
                  "Content-Type": "application/json"
                }
            }).then(function(data) {
              for(var k = 0; k < data.data.searchCandidates.length; k++) {
                let record = data.data.searchCandidates[k];
                record.keyword = keywords[i];
                result.push(record);
              }
            })
          }
        }

        // placeIds.filter((item, index) => { return placeIds.indexOf(item) === index });
        // for(var i = 0; i < placeIds.length; i++) {
        //   let url = 'https://maps.googleapis.com/maps/api/place/details/json?place_id='+placeIds[i]+'&key=AIzaSyAX1ncLI3aJ8K5tInzJjI1yjvgqllVbg9Y';
        //   await axios.get(url).then(response => {
        //     if (response && response.data)
        //         result.push(response.data.result);
        //   });
        // }
        return result;
    };
}


module.exports = SearchDB;
