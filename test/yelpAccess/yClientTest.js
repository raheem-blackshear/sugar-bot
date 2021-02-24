'use strict';
/**
 * Created by barre on 7/9/2017.
 */
let YClient = require('../../js/yelpAccess/yClient');
let assert = require('assert');

describe('YClient',()=>{
    describe('Constructor',()=>{
        it('Works',()=>{
            let yc = new YClient();
            assert.ok(yc);
        });
    });
    describe('Get Client',()=>{
        it('Works',(done)=>{
            let yc = new YClient();
            yc.getClient().then(client => {
                assert.ok(client);
                let yc2 = new YClient();
                yc2.getClient().then(client2 => {
                    assert.ok(client2);
                    done();
                });
            }).catch(err => {
                console.log(err);
                done(err);
            });
        });
    });

});