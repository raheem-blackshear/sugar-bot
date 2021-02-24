'use strict'
/**
 * Created by barre on 7/5/2017.
 */
let assert = require('assert');
let Companies = require('../../../js/dataAccess/models/companies');

describe("Companies",function(){
    describe("Constructor",function(){
        it("Should work",function(){
            let companies = new Companies();
            assert.ok(companies);
        });
    });

    describe("Save",function(){
        it("Should work",done => {
            let company = new Companies();
            company.name = "DevFoundries";
            company.yelpId = "asdfasd";
            company.address = "3901 Briones Street";
            company.save().then(saved => {
                console.log(saved);
                assert.ok(saved);
                Companies.remove({_id : saved._id}).then(res=> {
                    assert.ok(res.result.ok);
                    done();
                });
            }).catch(e => {
                console.log(e)
                done(e);
            });


        });
    });
});

