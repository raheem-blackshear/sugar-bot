'use strict';
/**
 * Created by barre on 7/8/2017.
 */
let categories = require('./categories.json');
let _ = require('lodash');

class CategoriesLoader {

    constructor(){
        let _parentsTemp = new Set();
        this._parents = [];

        _.each(categories,(element) =>{
            _.each(element.parents,(parent)=>{
                _parentsTemp.add(parent);
            });
        });

        _parentsTemp.forEach((key)=>{
            var one = _.find(categories,_.matchesProperty('alias',key));
            this._parents.push({title: one.title, alias: one.alias});
        });
    }

    findCategoriesForParent(parent) {
        var retval = _.filter(categories,(e) => {
            return _.indexOf(e.parents,parent) > -1;
        });
        return retval;
    }

    set parents(val) { this._parents = val;}
    get parents() { return this._parents;}

}



module.exports = CategoriesLoader;