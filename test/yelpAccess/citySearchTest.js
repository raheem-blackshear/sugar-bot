'use strict';
/**
 * Created by barre on 7/5/2017.
 */
let assert = require('assert');
let CitySearch = require('../../js/yelpAccess/citySearch');
let Companies = require('../../js/dataAccess/models/companies');
let SearchCriteria = require('../../js/yelpAccess/searchCritera');
let CategoryLoader = require('../../js/yelpAccess/categoriesLoader');
let _ = require('lodash');

var cats = new CategoryLoader();

describe('CitySearch', () => {
    describe('Constructor', () => {
        it('Should work', () => {
            let citySearch = new CitySearch();
            assert.ok(citySearch);
        });
    });

    describe('GetBusinessInfo', () => {
        it('Should work', (done) => {
            let cs = new CitySearch();
            cs.getInfoById('austin-taco-project-austin').then((result) => {
                assert.ok(result);
                done();
            }).catch(err => {
                done(err)
            })

        });
    });


    describe('Get top for city', () => {
        it('Should work', (done) => {
            let cs = new CitySearch();
            let sc = new SearchCriteria();

            sc.location = "austin, tx";
            sc.term = 'devfoundries';
            sc.categories = cats.parents[6].alias;
            sc.limit = 50;
            cs.getTopForCity(sc.yelpModel()).then(res => {
                let toAdd = [];
                let promises = [];
                for (let i = 0; i < res.businesses.length; i++) {
//                    var bus = ;
                    promises.push(cs.getInfoById(res.businesses[i].id).then((res2) => {
                        let localBiz = res.businesses[i];
                        let company = new Companies();
                        company.name = localBiz.name;
                        company.yelpId = localBiz.id;
                        company.address = localBiz.location;
                        company.yelpBody = localBiz;
                        company.yelpBusinessBody = res2;
                        toAdd.push(company);
                    }));
                }
                Promise.all(promises).then(() => {
                    console.log("Waiting...");
                    Companies.insertMany(toAdd);
                    done();
                });
            }).catch(err => {
                console.log(err);
                done(err);
            });

//            sc.categories("software");
//            sc.terms()

        });
    });


});
