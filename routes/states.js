'use strict';
/**
 * Created by barre on 7/16/2017.
 */
let express = require('express');
let passport = require('passport');
let router = express.Router();
let References = require('../js/dataAccess/models/references');

router.use((req,res,next) => {
    next();
});

router.get('/all',
    passport.authenticate('basic', {session: false}), function(req, res, next){
        References.find({key: "state"},{values: 1, "values.value": 1}).then(results => {
        res.json(results[0].values);
        });
    }
);

module.exports = router;