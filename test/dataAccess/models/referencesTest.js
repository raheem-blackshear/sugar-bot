'use strict';
/**
 * Created by barre on 7/16/2017.
 */
let assert = require('assert');
let References = require('../../../js/dataAccess/models/references');
let Industries = require('../../../js/dataAccess/models/industries');

describe('References',()=>{
    describe('Constructor',()=>{
        it('Should work',()=>{
            let reference = new References();
            assert.ok(reference);
        });
    });

    describe('Gross Revenue',()=>{
        it('Should work',(done)=>{
            let reference = new References();
            reference.key = "grossRevenue";
            reference.label = "Gross Revenue";
            reference.values = [
                {key: "0", value: "0", label: "0"},
                {key: "100000", value: "100000", label: "100,000"},
                {key: "500000", value: "500000", label: "500,000"},
                {key: "1000000", value: "1000000", label: "1,000,000"},
                {key: "2000000", value: "2000000", label: "2,000,000"},
                {key: "5000000", value: "5000000", label: "5,000,000"},
                {key: "10000000", value: "10000000", label: "10,000,000"},
                {key: "50000000", value: "50000000", label: "50,000,000"},
                {key: "100000000", value: "100000000", label: "100,000,000"},
                {key: "500000000", value: "500000000", label: "500,000,000"},
                {key: "1000000000", value: "1000000000", label: "1,000,000,000"},
                {key: "5000000000", value: "5000000000", label: "5,000,000,000"},
                {key: "10000000000", value: "10000000000", label: "10,000,000,000"},
                {key: "100000000000", value: "100000000000", label: "100,000,000,000"},
            ];
            reference.save().then((record) => {
                assert.ok(record);
                assert.ok(record.id);
                reference.remove().then((res) =>{
                    console.log(res);
                    done();
                });
            });

        });
    });

    describe('Net Revenue',()=>{
        it('Should work',(done)=>{
            let reference = new References();
            reference.key = "netRevenue";
            reference.label = "Net Revenue";
            reference.values = [
                {key: "0", value: "0", label: "0"},
                {key: "100000", value: "100000", label: "100,000"},
                {key: "500000", value: "500000", label: "500,000"},
                {key: "1000000", value: "1000000", label: "1,000,000"},
                {key: "2000000", value: "2000000", label: "2,000,000"},
                {key: "5000000", value: "5000000", label: "5,000,000"},
                {key: "10000000", value: "10000000", label: "10,000,000"},
                {key: "50000000", value: "50000000", label: "50,000,000"},
                {key: "100000000", value: "100000000", label: "100,000,000"},
                {key: "500000000", value: "500000000", label: "500,000,000"},
                {key: "1000000000", value: "1000000000", label: "1,000,000,000"},
                {key: "5000000000", value: "5000000000", label: "5,000,000,000"},
                {key: "10000000000", value: "10000000000", label: "10,000,000,000"},
                {key: "100000000000", value: "100000000000", label: "100,000,000,000"},
            ];
            reference.save().then((record) => {
                assert.ok(record);
                assert.ok(record.id);
                reference.remove().then((res) =>{
                    console.log(res);
                    done();
                });
                // done();
            });

        });
    });

    describe('Year Founded',()=>{
        it('Should work',(done)=>{
            let reference = new References();
            reference.key = "yearFounded";
            reference.label = "Year Founded";
            for (let i = 1800; i <= 2017; i++ )
            {
                reference.values.unshift(
                    {key: i, value: i, label: i}
                );
            }
            reference.save().then((record) => {
                assert.ok(record);
                assert.ok(record.id);
                reference.remove().then((res) =>{
                    console.log(res);
                    done();
                });
                // done();
            });
        });
    });

    describe('Number Of Employees',()=>{
        it('Should work',(done)=>{
            let reference = new References();
            reference.key = "numberOfEmployees";
            reference.label = "Number Of Employees";
            reference.values = [
                {key: "1", value: "1", label: "1"},
                {key: "10", value: "10", label: "10"},
                {key: "50", value: "50", label: "50"},
                {key: "100", value: "100", label: "100"},
                {key: "200", value: "200", label: "200"},
                {key: "500", value: "500", label: "500"},
                {key: "1000", value: "1000", label: "1,000"},
                {key: "5000", value: "5000", label: "5,000"},
                {key: "10000", value: "10000", label: "10,000"},
                {key: "50000", value: "50000", label: "50,000"},
                {key: "100000", value: "100000", label: "100,000"},
                {key: "500000", value: "500000", label: "500,000"},
            ];
            reference.save().then((record) => {
                assert.ok(record);
                assert.ok(record.id);
                reference.remove().then((res) =>{
                    console.log(res);
                    done();
                });
                // done();
            });
        });
    });

    describe('Number Of Employees',()=>{
        it('Should work',(done)=>{
            let reference = new References();
            reference.key = "numberOfEmployees";
            reference.label = "Number Of Employees";
            reference.values = [
                {key: "1", value: "1", label: "1"},
                {key: "10", value: "10", label: "10"},
                {key: "50", value: "50", label: "50"},
                {key: "100", value: "100", label: "100"},
                {key: "200", value: "200", label: "200"},
                {key: "500", value: "500", label: "500"},
                {key: "1000", value: "1000", label: "1,000"},
                {key: "5000", value: "5000", label: "5,000"},
                {key: "10000", value: "10000", label: "10,000"},
                {key: "50000", value: "50000", label: "50,000"},
                {key: "100000", value: "100000", label: "100,000"},
                {key: "500000", value: "500000", label: "500,000"},
            ];
            reference.save().then((record) => {
                assert.ok(record);
                assert.ok(record.id);
                reference.remove().then((res) =>{
                    console.log(res);
                    done();
                });
                // done();
            });
        });
    });

    describe('State',()=>{
        it('Should work',(done)=>{
            let reference = new References();
            reference.key = "state";
            reference.label = "State";
            reference.values = [
                { key:'AL', value:'AL',label:'Alabama'},
                { key:'AK', value:'AK',label:'Alaska'},
                { key:'AZ', value:'AZ',label:'Arizona'},
                { key:'AR', value:'AR',label:'Arkansas'},
                { key:'CA', value:'CA',label:'California'},
                { key:'CO', value:'CO',label:'Colorado'},
                { key:'CT', value:'CT',label:'Connecticut'},
                { key:'DE', value:'DE',label:'Delaware'},
                { key:'DC', value:'DC',label:'District of Columbia'},
                { key:'FL', value:'FL',label:'Florida'},
                { key:'GA', value:'GA',label:'Georgia'},
                { key:'HI', value:'HI',label:'Hawaii'},
                { key:'ID', value:'ID',label:'Idaho'},
                { key:'IL', value:'IL',label:'Illinois'},
                { key:'IN', value:'IN',label:'Indiana'},
                { key:'IA', value:'IA',label:'Iowa'},
                { key:'KS', value:'KS',label:'Kansas'},
                { key:'KY', value:'KY',label:'Kentucky'},
                { key:'LA', value:'LA',label:'Louisiana'},
                { key:'ME', value:'ME',label:'Maine'},
                { key:'MT', value:'MT',label:'Montana'},
                { key:'NE', value:'NE',label:'Nebraska'},
                { key:'NV', value:'NV',label:'Nevada'},
                { key:'NH', value:'NH',label:'New Hampshire'},
                { key:'NJ', value:'NJ',label:'New Jersey'},
                { key:'NM', value:'NM',label:'New Mexico'},
                { key:'NY', value:'NY',label:'New York'},
                { key:'NC', value:'NC',label:'North Carolina'},
                { key:'ND', value:'ND',label:'North Dakota'},
                { key:'OH', value:'OH',label:'Ohio'},
                { key:'OK', value:'OK',label:'Oklahoma'},
                { key:'OR', value:'OR',label:'Oregon'},
                { key:'MD', value:'MD',label:'Maryland'},
                { key:'MA', value:'MA',label:'Massachusetts'},
                { key:'MI', value:'MI',label:'Michigan'},
                { key:'MN', value:'MN',label:'Minnesota'},
                { key:'MS', value:'MS',label:'Mississippi'},
                { key:'MO', value:'MO',label:'Missouri'},
                { key:'PA', value:'PA',label:'Pennsylvania'},
                { key:'RI', value:'RI',label:'Rhode Island'},
                { key:'SC', value:'SC',label:'South Carolina'},
                { key:'SD', value:'SD',label:'South Dakota'},
                { key:'TN', value:'TN',label:'Tennessee'},
                { key:'TX', value:'TX',label:'Texas'},
                { key:'UT', value:'UT',label:'Utah'},
                { key:'VT', value:'VT',label:'Vermont'},
                { key:'VA', value:'VA',label:'Virginia'},
                { key:'WA', value:'WA',label:'Washington'},
                { key:'WV', value:'WV',label:'West Virginia'},
                { key:'WI', value:'WI',label:'Wisconsin'},
                { key:'WY', value:'WY',label:'Wyoming'},

            ];
            reference.save().then((record) => {
                assert.ok(record);
                assert.ok(record.id);
                reference.remove().then((res) =>{
                    console.log(res);
                    done();
                });
                // done();
            });
        });
    });

    describe('Industry',()=>{
        it('Should work',(done)=>{
            let industries = [];
            var categories = require('../../../js/yelpAccess/categories.json');
            for(const item of categories){
                let oneIndustry = new Industries(item);
                industries.unshift(oneIndustry);
            }

            // Industries.insertMany(industries).then((record) => {
            //     assert.ok(record);
            //     done();
            // }).catch(err => {done(err)});
        });
    });
});