"use strict";

let BingSearch = require('../js/bingCognitiveServices/bingSearch');
let assert = require('assert');

describe("Bing Search", () => {
    describe('Constructor', () => {
        it('Works', () => {
            let bing = new BingSearch();
            assert.ok(bing);
        });
    });

    describe("Web", () => {
        it('Works', (done) => {
            let bingSearch = new BingSearch();
            bingSearch.search("DevFoundries").then(res => {
                console.log(res);
                done();
            }).catch(err => {
                console.err(err);
                done(err);
            });
        });
    })
});