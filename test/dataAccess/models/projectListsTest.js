'use strict'
/**
 * Created by barre on 7/5/2017.
 */
let assert = require('assert');
let ProjectLists = require('../../../js/dataAccess/models/projectLists');
let Users = require('../../../js/dataAccess/models/users');
let Promise = require('bluebird');

describe("ProjectLists",function(){
    describe("Constructor",function(){
        it("Should work",function(){
            let lists = new ProjectLists();
            assert.ok(lists);
        });
    });

    describe("Save",function(){
        it("Should work",done => {
            Users.findOne({emailAddress: 'barrett@devfoundries.com'},{_id: 1}).then(res => {
                let one = new ProjectLists();
                one.name = "Google Knowledge Graph";
                one.entries = [
                    {name: "Wm. Barrett Simms",
                    company: "DevFoundries",
                    email: "barrett@devfoundries.com",
                    phone: "555-555-5555",
                    website: "https://devfoundries.com"}
                ];
                one.createdBy = res._id;
                one.save().then(saved => {
                    assert.ok(saved);
                    // ProjectLists.remove({_id : saved._id}).then(res=> {
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
    });
});

