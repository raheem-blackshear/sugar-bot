'use strict'
/**
 * Created by barre on 7/5/2017.
 */
let assert = require('assert');
let ProjectListCounts = require('../../../js/dataAccess/models/projectListCounts');
let Users = require('../../../js/dataAccess/models/users');
let Promise = require('bluebird');

describe("ProjectListCounts",function() {
    describe("Constructor", function () {
        it("Should work", function () {
            let counts = new ProjectListCounts();
            assert.ok(counts);
        });
    });

    describe("Get All", function () {
        it("Should work", function (done) {
            ProjectListCounts.find({}).lean().then(counts => {
                assert.ok(counts);
                done();
            }).catch(err => {
                done(err);

            });
        });
    });


});