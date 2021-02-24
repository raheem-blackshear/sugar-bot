'use strict';
let assert = require('assert');
let Users = require('../../../js/dataAccess/models/users');
let DataSources = require('../../../js/dataAccess/models/dataSources');
let Crypto = require('../../../js/crypto');

describe('Users',()=>{
    describe('Constructor',()=>{
        it('Works',()=>{
            let one = new Users();
            assert.ok(one);
        })
    });

    describe('Save One',()=>{
        it('Works',(done)=>{
            let one = new Users();
            one.emailAddress = 'barrett@devfoundries.com';
            one.lastName = "Simms";
            one.firstName = "Barrett";
            one.password = new Crypto().encrypt("123456");
            one.save().then(saved =>{
                assert.ok(saved);
//                done();
                one.remove().then(del =>{
                    assert.ok(del);
                    done();
                });
            }).catch(err => {console.error(err);done(err);});
            assert.ok(one);
        })
    });

    describe('Save with dataSource',()=>{
        it('Works',(done)=>{
            let one = new Users();
            one.emailAddress = 'barrett+1@devfoundries.com';
            one.fullName = "Barrett Simms";
            one.password = new Crypto().encrypt("123456");
            one.dateOfBirth = "1973/05/01";
            one.phoneNumber = "555-555-5555";
            one.company = "DevFoundries",


            one.subscriptions.push({id: "59c1386f1b0ce92b2c467360",subscribedDate : new Date().toUTCString(), active: true});
            one.save().then(saved =>{
                assert.ok(saved);
               done();
//                 one.remove().then(del =>{
//                     assert.ok(del);
//                     done();
//                 });
            }).catch(err => {console.error(err);done(err);});
            assert.ok(one);
        })
    });

    describe('Fetch with dataSource',()=>{
        it('Works',(done)=>{
            Users.findById("59c6ad6ab60bd829c019575b").populate('subscriptions.id').then(res => {
                assert.ok(res.subscriptions.id);
                done();
            });
        })
    });

    describe('Add subscription',()=>{
        it('Fails w/ duplicate',(done)=>{
            Users.findById("59c6ad6ab60bd829c019575b").then(user => {
                user.addSubscription('59c1386f1b0ce92b2c467360').then(res => {
                    assert.ok(res.message === "User already has dataSource");
                    done();
                })
            })
        })

        it('Works',(done)=>{
            Users.findById("5977df0fb1a2d3220851d852").then(user => {
                user.addSubscription('59c144bc15c43b2d94e9231b').then(res => {
                    assert.ok(!res.errors);
                    done();
                })
            })
        })

    })

    describe('Add StripeId',()=>{

        it('Works',(done)=>{
            Users.findById("5977df0fb1a2d3220851d852").then(user => {
                user.addStripeId('cus_BVAcPkEmbRYj2E').then(res => {
                    assert.ok(!res.errors);
                    done();
                })
            })
        })

    })



});
