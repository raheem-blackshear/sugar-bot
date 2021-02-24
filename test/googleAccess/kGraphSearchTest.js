'use strict';
let KGraphSearch = require('../../js/googleAccess/kGraphSearch');
const assert = require("assert");

describe('KGraphSearch',()=>{
    describe('Constructor',()=>{
        it('Works',()=>{
            let search = new KGraphSearch();
            assert.ok(search);
        })
    });

    describe('Search',()=>{
        it('Works',(done)=>{
            let search = new KGraphSearch();
            assert.ok(search);
            search.search("bicycle shop austin tx").then(res => {
                assert.ok(res);
                done();
            }).catch(err => {
                console.error(err);
                done(err);
            })
        })
    })

});