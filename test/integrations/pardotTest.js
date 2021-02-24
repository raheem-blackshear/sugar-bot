'use strict';

let assert = require('assert');
let request = require('superagent-bluebird-promise');
let PardotService = require('../../js/integrations/pardot');
let ProspectModel = require('../../js/integrations/prospectModel');
let pardotConfig = {
    email: "barrett@devfoundries.com",
    password: "4MyKarma!",
    key: "77caf078a98e9ac8d6a7b43687cfd35a"
};

describe('Pardot',()=>{
    describe('Constructor',()=> {
        it('Works', () => {
            let pardot = new PardotService(pardotConfig);
            assert.ok(pardot);
        });
    });

    describe('Get API Key',()=>{
        it('Works',(done)=>{
            let pardot = new PardotService(pardotConfig);
            assert.ok(pardot);
            pardot.getApiKey().then(res => {
                assert.ok(res);
                done();
            }).catch(err => {
                console.error(err);
                done(err);
            });
        });
    });

    describe('Upload',()=>{
        xit('Works',(done)=>{
            let pardot = new PardotService(pardotConfig);
            assert.ok(pardot);
            let prospect = new ProspectModel();
            prospect.email = "barrett@wbsimms.com";
            prospect.company = "wbsimms.com";
            prospect.firstName = "William";
            prospect.lastName = "Simms";
            prospect.address1 = "3901 Briones Street";
            prospect.city = "Austin";
            prospect.state = "TX";
            prospect.zip = "78723";
            prospect.phone = "555-555-5555";
            prospect.website = "https://wbsimms.com";
            prospect.jobTitle = "Founder";
            pardot.upload(prospect).then(res => {
                assert.ok(res);
                done();
            }).catch(err => {
                console.error(err);
                done(err);
            });
        });
    });
});