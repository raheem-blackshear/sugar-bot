'use strict';
/**
 * Created by barre on 7/16/2017.
 */
let express = require('express');
let router = express.Router();
let CitySearch = require('../js/yelpAccess/citySearch');
let PlacesSearch = require('../js/googlePlaces/searchPlaces.js');
let FourSquare = require('../js/fourSquare/fourSquare.js');
let SearchDB = require('../js/dbSearch/searchDB.js');
let BingSearch = require('../js/bingCognitiveServices/bingSearch');
let SearchCriteria = require('../js/yelpAccess/searchCritera');
let passport = require('passport');
let Search = require('../js/dataAccess/models/searches');
let KGraphSearch = require('../js/googleAccess/kGraphSearch');
let GCustomSearch = require('../js/googleAccess/customSearch');
let SearchFactory = require('../js/dataSourcesFactory');
let DataSources = require('../js/dataAccess/models/dataSources');
let Industries = require('../js/dataAccess/models/industries');
let _ = require('lodash');

let searchFactory = new SearchFactory();

let RouteUtil = require('./routeUtil');
let routeUtil = new RouteUtil();

let responseModel = {
    name: "",
    company: "",
    url: "",
    email: "",
    phone: ""
};

router.post('/',
    passport.authenticate('basic', {session: false}),
    function(req, res, next) {
        let request = req.body.search;
        let sources = req.body.sources;
        // if (!request.dataSources || request.dataSources.length === 0) {
        //     //routeUtil.sendBadRequest(res,"No data sources provided");
        //     //return;
        // }
        let location = request.position;
        // if (request.city) location = request.city+", "+location;
        let categories = '';
        if (request.industry) categories = request.industry;
        if (request.subindustry) categories = request.subindustry;
        if (request.subsubindustry) categories = request.subsubindustry;

        const searchCritera = {
            categories, location, term: request.term
        }
        let activeResults = [];
        let inactiveResults = [];
        Promise.all(sources.active.map(source => {
            return new Promise((resolve, reject) => {
                searchFromSource(searchCritera, source).then(results => {
                    activeResults = activeResults.concat(results);
                    resolve();
                }).catch(err => {
                    console.error(err);
                    resolve();
                });
            });
        })).then(() => Promise.all(sources.inactive.map(source => {
            return new Promise((resolve, reject) => {
                searchFromSource(searchCritera, source).then(results => {
                    inactiveResults = inactiveResults.concat(results);
                    resolve();
                }).catch(err => {
                    console.error(err);
                    resolve();
                });
            });
        }))).then(() => {
            let searchQuery = new Search();
            searchQuery.searchBody = request;
            searchQuery.userId = req.user.id;
            searchQuery.resultCount = activeResults.length + inactiveResults.length;
            return searchQuery.save();
        }).then(() => {
            routeUtil.sendOk(res, {active: activeResults, inactive: inactiveResults});
        }).catch(err => {
            routeUtil.sendError(res,err,"Unable to complete search.");
						console.error('error message',err);
        });
    }
);


router.post('/customSearch',
    passport.authenticate('basic', {session: false}), function(req, res, next) {
        let request = req.body;
        let searcher = new GCustomSearch();
        let location = request.state;
        if (request.city) location = request.city+", "+location;
        let retval = [];
        searcher.search(request.tags+" "+location).then(result => {
            result.body.items.forEach(item => {
                retval.push({
                    url: item.link,
                    title: item.title
                });
            });
            routeUtil.sendOk(res,retval);
        }).catch(err => {
            routeUtil.sendError(res,err,"Unable to run search.");
        })
    }
);

router.post('/similarTerms',
    passport.authenticate('basic', {session: false}),
    function(req, res, next){
        let request = req.body;
        if (!request.term) next();
        let searcher = new KGraphSearch();
        searcher.search(request.term).then(req => {
            let retval = [];
            req.itemListElement.forEach(item => {
                retval.push({
                    text: item.result.name,
                });
            });
            let ret = _.uniqBy(retval,'text');
            routeUtil.sendOk(res,ret);
        }).catch(err=>{
            routeUtil.sendError(res,err,"Unable to get similar terms.");
        });
});

router.get('/detail/:businessName',
    passport.authenticate('basic', {session: false}), function(req, res, next){
    if (!req.params.businessName) {
        routeUtil.sendBadRequest(res,"No id provided");
    }

    new BingSearch().search(req.params.businessName).then((response) => {
            routeUtil.sendOk(res,response);
        }).catch(err => {
            routeUtil.sendError(res,err,"Unable to lookup business.");
        })
});

function searchFromSource(searchCritera, source) {
    if (source.title.includes('Yelp')) {
        return searchYelp(searchCritera, source.id);
    } else if (source.title.includes('Google Places')) {
        return searchGooglePlaces(searchCritera, source.id);
    } else if (source.title.includes('Four')) {
        return searchFourSquare(searchCritera, source.id);
    } else if (source.title.includes('D&B')) {
        return searchDB(searchCritera, source.id, source.title);
    }
    return Promise.resolve([]);
}

function searchDB(searchCriteria, sourceId, sourceTitle) {
    const sc = new SearchCriteria();
    sc.categories = searchCriteria.categories;
    sc.location = searchCriteria.location;
    sc.term = searchCriteria.term;
    sc.limit = 50;
    let cs = new SearchDB();
    let results = [];

    return cs.search(sc.yelpModel(), sourceTitle).then(response => {
        if (response && response.length > 0){
            response.forEach(biz => {
                let yelpBiz = {
                    name: biz.contact?(biz.contact.givenName + ' ' + biz.contact.familyName):"",
                    company: biz.organization?biz.organization.primaryName:biz.contact.organization.primaryName,
                    website: biz.organization?biz.organization.domain:"",
                    email: biz.contact?biz.contact.email:'',
                    phone: biz.contact?((biz.contact.telephone && biz.contact.telephone.length>0)?biz.contact.telephone[0].telephoneNumber:""):((biz.organization.telephone && biz.organization.telephone.length>0)?biz.organization.telephone[0].telephoneNumber:""),
                    address1: biz.contact?(biz.contact.organization.primaryAddress.streetAddress?biz.contact.organization.primaryAddress.streetAddress.line1:""):(biz.organization.primaryAddress.streetAddress?biz.organization.primaryAddress.streetAddress.line1:""),
                    address2: '',
                    city: biz.contact?biz.contact.organization.primaryAddress.addressLocality.name:biz.organization.primaryAddress.addressLocality.name,
                    state: biz.contact?biz.contact.organization.primaryAddress.addressRegion.name:biz.organization.primaryAddress.addressRegion.name,
                    zipcode: biz.contact?biz.contact.organization.primaryAddress.postalCode:biz.organization.primaryAddress.postalCode,
                    country: biz.contact?biz.contact.organization.primaryAddress.addressCountry.isoAlpha2Code:biz.organization.primaryAddress.addressCountry.isoAlpha2Code,
                    source: sourceId,
                    keyword: biz.keyword,
                    detail: biz
                };
                results.push(yelpBiz);
            });
        }

        let keywords = sc.term.split(',');
        for(var i = 0; i < keywords.length; i++) {
          let records = _.filter(results, function(record) { return record.keyword == keywords[i] });
          let one = new DataSources();
          one.location = sc.location;
          one.keyword = keywords[i];
          one.records = records;
          one.dataSource = sourceId;
          one.save();
        }

        return results;
    });
}

function searchYelp(searchCriteria, sourceId) {
    const sc = new SearchCriteria();
    sc.categories = searchCriteria.categories;
    sc.location = searchCriteria.location;
    sc.term = searchCriteria.term;
    sc.limit = 50;
    let cs = new CitySearch();
    let results = [];
    return cs.search(sc.yelpModel()).then(response => {
        response.forEach(biz => {
            let categories = [];
            biz.categories.forEach(function(category) {
              categories.push(category.title);
            })
            let yelpBiz = {
                name: '',
                company: biz.name,
                website: biz.url,
                email: '',
                phone: biz.display_phone,
                address1: biz.address1,
                address2: biz.address2,
                city: biz.location.city,
                state: biz.location.state,
                zipcode: biz.location.zip_code,
                country: biz.location.country,
                rating: biz.rating,
                userRatingTotal: '',
                reviewCount: biz.review_count,
                reviews: [],
                latitude: biz.coordinates.latitude,
                longitude: biz.coordinates.longitude,
                categories: categories,
                source: sourceId,
                detail: biz
            };
            results.push(yelpBiz);
        });

        // let one = new DataSources();
        // one.location = sc.location;
        // one.keyword = sc.term;
        // one.records = results;
        // one.dataSource = sourceId;
        // one.save();
        return results;
    });
}

function searchGooglePlaces(searchCriteria, sourceId) {
    const sc = new SearchCriteria();
    sc.categories = searchCriteria.categories;
    sc.location = searchCriteria.location;
    sc.term = searchCriteria.term;
    let ps = new PlacesSearch();
    let results = [];
    return ps.search(sc.googlePlacesModel()).then(response => {
        response.forEach(place => {
            let places = {
                name: '',
                company: place.name?place.name:'',
                website: place.url,
                email: '',
                phone: place.formatted_phone_number?place.formatted_phone_number:'',
                address1: '',
                address2: '',
                city:'',
                state:'',
                zipcode:'',
                country:'',
                rating: place.rating?place.rating:0,
                userRatingTotal: place.user_ratings_total?place.user_ratings_total:0,
                reviewCount: place.reviews?place.reviews.length:0,
                reviews: place.reviews?place.reviews:[],
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
                categories: place.types,
                source: sourceId,
                detail: place
            };
            for(var i = 0; i < place.address_components.length; i++) {
                if(place.address_components[i].types[0] == 'country')
                  places.country = place.address_components[i].short_name;
                if(place.address_components[i].types[0] == 'administrative_area_level_1')
                  places.state = place.address_components[i].short_name;
                if(place.address_components[i].types[0] == 'locality')
                  places.city = place.address_components[i].long_name;
                if(place.address_components[i].types[0] == 'postal_code')
                  places.zipcode = place.address_components[i].long_name;
                if(place.address_components[i].types[0] == 'street_number')
                  places.address1 = place.address_components[i].long_name;
                if(place.address_components[i].types[0] == 'route')
                  places.address1 += places.address1?' '+place.address_components[i].short_name:place.address_components[i].short_name;
            }
            results.push(places);
        });
        // let keywords = sc.term.split(',');
        // for(var i = 0; i < keywords.length; i++) {
        //   let records = _.filter(results, function(record) { return record.keyword == keywords[i] });
        //   let one = new DataSources();
        //   one.location = sc.location;
        //   one.keyword = keywords[i];
        //   one.records = records;
        //   one.dataSource = sourceId;
        //   one.save();
        // }

        return results;
    });
}

function searchFourSquare(searchCriteria, sourceId) {
    const sc = new SearchCriteria();
    sc.categories = searchCriteria.categories;
    sc.location = searchCriteria.location;
    sc.term = searchCriteria.term;
    let ps = new FourSquare();
    let results = [];
    return ps.search(sc.googlePlacesModel()).then(response => {
        response.forEach(place => {
            let categories = [];
            place.categories.forEach(function(category) {
              categories.push(category.name);
            })
            let places = {
                name: '',
                company: place.name,
                website: place.url,
                email: '',
                phone: place.contact.formattedPhone,
                address1: place.location.address,
                address2: '',
                city: place.location.city,
                state: place.location.state,
                zipcode: place.location.postalCode,
                country: place.location.country,
                rating: place.rating,
                userRatingTotal: place.ratingSignals?place.ratingSignals:'',
                reviewCount: '',
                reviews: [],
                latitude: place.location.lat,
                longitude: place.location.lng,
                categories: categories,
                source: sourceId,
                keyword: place.keyword,
                detail: place
            };
            results.push(places);
        });

        // let keywords = sc.term.split(',');
        // for(var i = 0; i < keywords.length; i++) {
        //   let records = _.filter(results, function(record) { return record.keyword == keywords[i] });
        //   let one = new DataSources();
        //   one.location = sc.location;
        //   one.keyword = keywords[i];
        //   one.records = records;
        //   one.dataSource = sourceId;
        //   one.save();
        // }

        return results;
    });
}

module.exports = router;
