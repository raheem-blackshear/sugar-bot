'use strict';
/**
 * Created by barre on 7/16/2017.
 */
let express = require('express');
let router = express.Router();
let passport = require('passport');
let RouteUtil = require('./routeUtil');
let routeUtil = new RouteUtil();
let Pardot = require('../js/integrations/pardot');
let ProspectModel = require('../js/integrations/prospectModel');
let ProjectLists = require('../js/dataAccess/models/projectLists');


router.get('/pardot/:listId',
    passport.authenticate('basic', {session: false}),
    function(req, res, next){
        if (!req.params || !req.params.listId) {
            routeUtil.sendError(res, {},"No list id provided");
            return;
        }
        if (!req.user.integrations || !req.user.integrations.pardot) {
            routeUtil.sendBadRequest(res,"User has no Pardot settings");
            return;
        }
        let pardotSettings = req.user.integrations.pardot;
        ProjectLists.findById(req.params.listId).then(projectList => {
            let p1 = [];
            let pardot = new Pardot(pardotSettings);
            projectList.entries.forEach(entry => {
                if (!entry.crmSynced) {
                    let p = new ProspectModel();
                    p.company = entry.company;
                    p.firstName = entry.name;
                    p.phone = entry.phone;
                    p.address1 = entry.address1;
                    p.address2 = entry.address2;
                    p.website = entry.yelp_url;
                    p.email = entry.email;
                    p1.push(pardot.upload(p).then(res => {
                        entry.crmSynced = true;
                        return res;
                    }));
                }
            });
            Promise.all(p1).then(res => {
                projectList.save();
                routeUtil.sendOk(res,"Records sent to Pardot.");
            });
        }).catch(err=> {
            console.error(err);
            routeUtil.sendError(res,err,"Unable to find list id");
        })



    });


module.exports = router;