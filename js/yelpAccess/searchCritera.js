'use strict';
/**
 * Created by barre on 7/8/2017.
 */
class SearchCritera {

    get offset() { return this._offset }
    set offset(val) { this._offset = val  }

    get location() { return this._location }
    set location(val) { this._location = val }

    set term (val) {this._term = val; }
    get term () { return this._term; }

    set categories (val) {this._categories = val; }
    get categories () { return this._categories; }

    set limit (val) {this._limit = val; }
    get limit () { return this._limit; }

    set radius (val) {this._radius = val; }
    get radius () { return this._radius; }

    set sortBy (val) { this._sortBy = val; }
    get sortBy () { return this._sortBy; }


    set price (val) { this._price = val; }
    get price () { return this._price; }

    yelpModel() {
        let retval = {};
        if (this._location) retval.location = this._location;
        if (this._term) retval.term = this._term;
        if (this._categories) retval.categories= this._categories;
        if (this._limit) retval.limit = this._limit;
        if (this._price) retval.price = this._price;
        if (this._radius) retval.radius = this._radius;
        if (this._sortBy) retval.sort_by = this._sortBy;
        if (this._offset) retval.offset = this._offset;
        return retval;
    };

    googlePlacesModel() {
        let retval = {};
        if (this._location) retval.location = this._location;
        if (this._term) retval.term = this._term;
        if (this._categories) retval.categories= this._categories;
        return retval;
    }
}

module.exports = SearchCritera;
