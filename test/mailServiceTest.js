'use strict';

let assert = require('assert');
let MailService = require('../js/mailService');

describe("MailService",()=>{
    describe("Constructor",()=>{
        it("Works",()=>{
            let ms = new MailService();
            assert.ok(ms);
        });
    });

    describe("Send",()=>{
        it("Works",(done)=>{
            let ms = new MailService();
            ms.sendEmail("admin@sugarbottomstudios.com","SugarBot Admin", "Test Mail", "This is some text",["jstriker@utexas.edu"]).then(res => {
                console.log(res);
                done();
            }).catch(err => {
                console.error(err);
                done()
            });
            assert.ok(ms);
        });
    });

});