"use strict";

/**
 * Created by barre on 7/8/2017.
 */
let categories = require('../../js/yelpAccess/categories.json');
let CategoriesLoader = require('../../js/yelpAccess/categoriesLoader');
let assert = require('assert');
let _ = require('lodash');


describe('Categories',() =>{
    describe('Load',()=>{
        it('Should work',()=>{
            assert.ok(categories);
        });
    });

});

describe('CategoriesLoader',() =>{
    describe('Constructor',()=>{
        it('Should work',()=>{
            let loader = new CategoriesLoader();
            assert.ok(loader);
        });
    });
    describe('Parents',()=>{
        it('Should not be empty',()=>{
            let loader = new CategoriesLoader();
            let parents = loader.parents;
            assert.ok(parents);
            assert.ok(parents.length > 1);
        });
    });
    describe('FindCategoriesForParent',()=>{
        it('Should return correctly',()=>{
            let loader = new CategoriesLoader();
            var cats = loader.findCategoriesForParent("italian");
            assert.ok(cats);
            assert.ok(cats.length > 1);
        });
    });
    describe('FindCategoriesForParent Italian',()=>{
        it('restaurants has italian',()=>{
            let loader = new CategoriesLoader();
            var cats = loader.findCategoriesForParent("restaurants");
            assert.ok(cats.length > 1);
            var one = _.find(cats,{'alias':'italian'});
            assert.ok(one);
        });
    });

});