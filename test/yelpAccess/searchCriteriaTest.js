'use strict';
/**
 * Created by barre on 7/8/2017.
 */

const assert = require('assert');
let SearchCritera = require('../../js/yelpAccess/searchCritera');

describe('Search Criteria',() => {
    describe('Constructor',() => {
        it('Works',() => {
            let sc = new SearchCritera();
            assert.ok(sc);
        })
    });

    describe('Setter',()=>{
       it('Should work',()=>{
           let sc = new SearchCritera();
           sc.location = "austin, tx";
           assert.ok(sc);
           assert.ok(sc.location === "austin, tx");

       });
    });
});