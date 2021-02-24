'use strict';

let express = require('express');
let passport = require('passport');
let router = express.Router();
let ProjectLists = require('../js/dataAccess/models/projectLists');
let RouteUtil = require('./routeUtil');
let routeUtil = new RouteUtil();
let _ = require('lodash');

router.get('/',
    passport.authenticate('basic', {session: false}),
    (req,res,next) => {
        let userId = req.user.id;
        ProjectLists.find({ createdBy: userId }, { _id: 1, name: 1, entries: 1 }).then(response => {
            routeUtil.sendOk(res,response);
        }).catch(err => {
            routeUtil.sendError(res,err,"Unable to find lists for user");
        });
    }
);

router.post('/checkListName',
    passport.authenticate('basic', {session: false}), function (req, res, next) {
        if (!req.body.listName) {
            res.status(400).send({status: "Bad Request", message: "No model provided."});
            next();
        }
        ProjectLists.find({name: req.body.listName}).then(list => {
            console.log(list);
            if (list.length > 0) {
                res.status(200).send({status: false});
            } else {
                res.status(200).send({status: true});
            }
        });
    }
);

router.post('/',
    passport.authenticate('basic', {session: false}),
    (req,res,next) => {
        if (!req.body) sendBadRequest(res,"No list data provided");

        let newList = new ProjectLists(req.body);

        newList.createdBy = req.user._id;
        newList.createdDate = new Date().toUTCString();
        newList.updatedDate = new Date().toUTCString();
        newList.active = true;
        newList.save().then(saved => {
            routeUtil.sendOk(res,saved);
        }).catch(err => {
            routeUtil.sendError(res,err,"Unable to save list");
        });
    }
);

router.post('/:id',
    passport.authenticate('basic', {session: false}),
    (req,res,next) => {
        if (!req.body && !req.params.id) sendBadRequest(res,"Updates require a params id and body");
        ProjectLists.findByIdAndUpdate(req.params.id,{
            updatedDate: new Date().toUTCString(),
            entries: req.body.entries,
            name: req.body.name,
            active: req.body.active
        }).then(saved => {
            routeUtil.sendOk(res,saved);
        }).catch(err => {
            routeUtil.sendError(res,err,"Unable to save list");
        });
    }
);

router.delete('/:id',
    passport.authenticate('basic', {session: false}),
    (req,res,next) => {
        if (!req.params.id) sendBadRequest(res,"Deletes require a params id.");
        ProjectLists.findByIdAndUpdate(req.params.id,{
            updatedDate: new Date().toUTCString(),
            active: false
        }).then(saved => {
            routeUtil.sendOk(res,saved);
        }).catch(err => {
            routeUtil.sendError(res,err,"Unable to delete list");
        });
    }
);

// This can cause duplicates in the customers data. We aren't filtering for uniquness here.
router.post('/mergeInto/:id',
    passport.authenticate('basic', {session: false}),
    (req,res,next) => {
        if (!req.body && !req.params.id) sendBadRequest(res,"Updates require a params id and body");
        ProjectLists.findByIdAndUpdate(req.params.id,{
            $set: {updatedDate: new Date().toUTCString()},
            $push: {'entries': {$each : req.body.entries}}
        }).then(saved => {
            routeUtil.sendOk(res,saved);
        }).catch(err => {
            routeUtil.sendError(res,err,"Unable to save list");
        });
    }
);

//given ID, returns all data for one project list
router.get('/:id',
    passport.authenticate('basic', {session: false}),
    (req,res,next) => {
        let projectId = req.params.id;
        ProjectLists.find({projectId: projectId}).then(response => {
            routeUtil.sendOk(res,response);
        }).catch(err => {
            routeUtil.sendError(res,err,"Unable to find lists for user");
        });
    }
);


router.get('/downloadCSV/:projectListId',
    passport.authenticate('basic', {session: false}),
    (req,res,next) => {
        let projectListId = req.params.projectListId;

        ProjectLists.findById(projectListId).then(response => {
            const createCsvWriter = require('csv-writer').createObjectCsvWriter;
            const csvWriter = createCsvWriter({
              path: 'out.csv',
              header: [
                {id: 'name', title: 'Name'},
                {id: 'company', title: 'Company'},
                {id: 'email', title: 'Email'},
                {id: 'address1', title: 'Address1'},
                {id: 'address2', title: 'Address2'},
                {id: 'website', title: 'Url'},
                {id: 'phone', title: "Phone"}
              ]
            });

            csvWriter.writeRecords(response.entries)
              .then(
                ()=>res.download("out.csv")
              );
        }).catch(err => {
            routeUtil.sendError(res,err,"Unable to find lists for user");
        });
    }
);

router.post('/downloadCSV/multiple',
    passport.authenticate('basic', {session: false}),
    (req,res,next) => {
        ProjectLists.find( { _id: { $in: req.body } } ).then(response => {
            const createCsvWriter = require('csv-writer').createObjectCsvWriter;
            const csvWriter = createCsvWriter({
              path: 'out.csv',
              header: [
                {id: 'name', title: 'Name'},
                {id: 'company', title: 'Company'},
                {id: 'email', title: 'Email'},
                {id: 'address1', title: 'Address1'},
                {id: 'address2', title: 'Address2'},
                {id: 'website', title: 'Url'},
                {id: 'phone', title: "Phone"}
              ]
            });
            let result = [];
            console.log(response);
            response.forEach(function(list) {
              for(var i = 0; i < list.entries.length; i++)
                result.push(list.entries[i]);
            });
            csvWriter.writeRecords(result)
              .then(
                ()=>res.download("out.csv")
              );
        }).catch(err => {
            routeUtil.sendError(res,err,"Unable to find lists for user");
        });
    }
);

router.post('/updateEntry/:projectListId/:entryId',
    passport.authenticate('basic', {session: false}),
    (req,res,next) => {
        if (!req.params || !req.params.projectListId || !req.params.entryId) {
            return routeUtil.sendBadRequest(res,"You must supply a projectListId and entryId");
        }
        ProjectLists.findById(req.params.projectListId).then(projectList => {
            let entries = _.filter(projectList.entries,entry => {
                return entry._id == req.params.entryId;
            });
            if (entries && entries.length > 0) {
                projectList.entries[projectList.entries.indexOf(entries[0])] = req.body.entry;
                projectList.update({$set: { entries : projectList.entries}}).then(result => {
                    routeUtil.sendOk(res, projectList);
                });
            } else {
                routeUtil.sendOk(res,{},"Unable to find entry in list");
            }
        }).catch(err=>{
            console.error(err);
            routeUtil.sendError(res,err,"Unable to update list");
        })
    });

router.get('/deleteEntry/:projectListId/:entryId',
    passport.authenticate('basic', {session: false}),
    (req,res,next) => {
        if (!req.params || !req.params.projectListId || !req.params.entryId) {
            return routeUtil.sendBadRequest(res,"You must supply a projectListId and entryId");
        }
        ProjectLists.findById(req.params.projectListId).then(projectList => {
            let removed = _.remove(projectList.entries,entry => {
                return entry._id == req.params.entryId;
            });
            if (removed && removed.length > 0) {
                projectList.update({$set: { entries : projectList.entries}}).then(result => {
                    routeUtil.sendOk(res, projectList);
                });
            } else {
                routeUtil.sendOk(res,{},"Unable to find entry in list");
            }
        }).catch(err=>{
            console.error(err);
            routeUtil.sendError(res,err,"Unable to update list");
        })
    });
module.exports = router;
