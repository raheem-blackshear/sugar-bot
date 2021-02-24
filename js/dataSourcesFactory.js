'use strict';

let BingCognitiveServices = require('./bingCognitiveServices/bingSearch');
let GoogleCustomSearch = require('./googleAccess/customSearch');
let GoogleKGraph = require('./googleAccess/kGraphSearch');
let YelpSearch = require('./yelpAccess/citySearch');
let DataSources = require('./dataAccess/models/dataSources');

let lookupById = {};
class DataSourcesFactory {

    constructor() {
        this.lookupById = {};
        DataSources.find({active: true},{key: 1, _id: 1}).then(res => {
            res.forEach(item => {
                this.lookupById[item._id] = item.key;
            });
        });
    }

    static GetDataSourceByName(sourceName) {
        switch (sourceName) {
            case 'bingCognitiveServices':
                return new BingCognitiveServices();
            case 'googleCustomSearch':
                return new GoogleCustomSearch();
            case 'googleKnowledgeGraph' :
                return new GoogleKGraph();
            case 'yelpSearch' :
                return new YelpSearch();
            default :
                return {};
        }
    }

    getDataSourceByName(sourceName) {
        switch (sourceName) {
            case 'bingCognitiveServices':
                return new BingCognitiveServices();
            case 'googleCustomSearch':
                return new GoogleCustomSearch();
            case 'googleKnowledgeGraph' :
                return new GoogleKGraph();
            case 'yelpSearch' :
                return new YelpSearch();
            default :
                return {};
        }
    }


    getDataSourceById(dataSourceId) {
        this.getDataSourceByName(this.lookupById[dataSourceId]);
    }


}

module.exports = DataSourcesFactory;