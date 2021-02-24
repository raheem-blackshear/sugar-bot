'use strict'
/**
 * Created by barre on 7/5/2017.
 */
let assert = require('assert');
let DataSources = require('../../../js/dataAccess/models/dataSources');

describe("DataSources",function(){
    describe("Constructor",function(){
        it("Should work",function(){
            let dataSources = new DataSources();
            assert.ok(dataSources);
        });
    });

    describe("Save",function(){
        it("Should work",done => {
            let one = new DataSources();
            one.label = "Google Knowledge Graph";
            one.isRecommended = true;
            one.key = "googleKGraph";
            one.save().then(saved => {
                console.log(saved);
                assert.ok(saved);
                // DataSources.remove({_id : saved._id}).then(res=> {
                //     assert.ok(res.result.ok);
                //     done();
                // });
                done();
            }).catch(e => {
                console.log(e);
                done(e);
            });


        });
    });

    describe("Get Defaults",function(){
        it("Should work",function(done){
            DataSources.recommended().then(res => {
                assert.ok(res);
                assert.ok(res.length > 0);
                done();
            }).catch(err => {
                console.error(err);
                done(err);
            });
        });
    });
    describe("Get All",function(){
        it("Should work",function(done){
            DataSources.find({}).then(res => {
                assert.ok(res);
                assert.ok(res.length > 0);
                done();
            }).catch(err => {
                console.error(err);
                done(err);
            });
        });
    });
});

