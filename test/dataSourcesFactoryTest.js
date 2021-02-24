'use strict';

let assert = require('assert');
let DataSourcesFactory = require('../js/dataSourcesFactory');


describe("DataSourcesFactory",() => {
    describe("Constructor",()=>{
       it('Works',(done) => {
           let dsFactory = new DataSourcesFactory();
           assert.ok(dsFactory);
           done();
       });
    });

    describe("Get Bing Static",()=>{
        it('Works',() => {
            let dsFactory = new DataSourcesFactory();
            let service = DataSourcesFactory.GetDataSourceByName('bingCognitiveServices');
            assert.ok(service);
        });
    });

    describe("Get Bing",()=>{
        it('Works',() => {
            let dsFactory = new DataSourcesFactory();
            let service = dsFactory.getDataSourceByName('bingCognitiveServices');
            assert.ok(service);
            assert.equal(service.constructor.name, 'BingSearch');
        });
    });

    describe("Get Yelp",()=>{
        it('Works',() => {
            let dsFactory = new DataSourcesFactory();
            let service = dsFactory.getDataSourceByName('yelpSearch');
            assert.ok(service);
            assert.equal(service.constructor.name, 'CitySearch');
        });
    });

    describe("Get Google K Graph",()=>{
        it('Works',() => {
            let dsFactory = new DataSourcesFactory();
            let service = dsFactory.getDataSourceByName('googleKnowledgeGraph');
            assert.ok(service);
            assert.equal(service.constructor.name, 'KGraphSearch');
        });
    });

    describe("Get Google Custom Search",()=>{
        it('Works',() => {
            let dsFactory = new DataSourcesFactory();
            let service = dsFactory.getDataSourceByName('googleCustomSearch');
            assert.ok(service);
            assert.equal(service.constructor.name, 'CustomSearch');
        });
    });





});