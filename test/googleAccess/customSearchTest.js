'use strict';
let CustomSearch = require('../../js/googleAccess/customSearch');
const assert = require("assert");

describe('CustomSearch',()=>{
    describe('Constructor',()=>{
        it('Works',()=>{
            let search = new CustomSearch();
            assert.ok(search);
        })
    });

    describe('Search',()=>{
        it('Works',(done)=>{
            let search = new CustomSearch();
            search.search("DevFoundries Austin, TX").then(res => {
                assert.ok(res);
                done();
            }).catch(err => {
                console.error(err);
                done(err);
            })
        })
    })

});