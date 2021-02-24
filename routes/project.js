'use strict';
/**
 * Created by barre on 7/16/2017.
 */
let express = require('express');
let passport = require('passport');
let router = express.Router();
let Projects = require('../js/dataAccess/models/projects');
let ProjectListCounts = require('../js/dataAccess/models/projectListCounts');
let ProjectLists = require('../js/dataAccess/models/projectLists');

router.use((req, res, next) => {
    next();
});

router.get('/',
    passport.authenticate('basic', {session: false}), function (req, res, next) {
        ProjectLists.aggregate([
            { "$match": { "createdBy": req.user._id } },
            { "$unwind": "$dataSources" },
            { "$group": {
                "_id": "$projectId",
                 "contacts": {
                     "$sum": { "$size": "$entries" },
                 },
                 "dataSources": {
                     "$addToSet": "$dataSources"
                 },
                 "count": { $sum: 1 },
                 "lastSalesDate": { $last: "$updatedDate" }
             } }
         ]).then( listInfo => {
              let projectListInfo = {};
            listInfo.forEach(obj => {
                projectListInfo[obj._id] = {counts: obj.count, countDataSources: obj.dataSources.length, contacts: obj.contacts, lastdate: obj.lastSalesDate};
            });
            // Projects.find({createdBy: req.user._id}).populate('dataSources').lean().then(results => {
            Projects.find({createdBy: req.user._id}).lean().then(results => {
                results.forEach(proj => {
                    proj.dataSourcesCount = projectListInfo[proj._id]?projectListInfo[proj._id].countDataSources:0;
                    proj.projectListsCount = projectListInfo[proj._id]?projectListInfo[proj._id].counts:0;
                    proj.totalContacts  = projectListInfo[proj._id]?projectListInfo[proj._id].contacts:0;
                    proj.lastUpdate  = projectListInfo[proj._id]?projectListInfo[proj._id].lastdate:"";
                });
                res.status(200).send({status: "ok", response: results});
            });
        }).catch(err => {
            res.status(500).send({status: "error", response: err, message: "Unable to find projects for user"});
        });
    }
);

router.get('/all',
    passport.authenticate('basic', {session: false}), function (req, res, next) {
      ProjectLists.aggregate([
          { "$unwind": "$dataSources" },
          { "$group": {
              "_id": "$projectId",
               "contacts": {
                   "$sum": { "$size": "$entries" },
               },
               "dataSources": {
                   "$addToSet": "$dataSources"
               },
               "count": { $sum: 1 },
               "lastSalesDate": { $last: "$updatedDate" }
           } }
       ]).then( listInfo => {
            let projectListInfo = {};
          listInfo.forEach(obj => {
              projectListInfo[obj._id] = {counts: obj.count, countDataSources: obj.dataSources.length, contacts: obj.contacts, lastdate: obj.lastSalesDate};
          });
          // Projects.find({createdBy: req.user._id}).populate('dataSources').lean().then(results => {
          Projects.find({}).populate('createdBy').lean().then(results => {
              results.forEach(proj => {
                  proj.dataSourcesCount = projectListInfo[proj._id]?projectListInfo[proj._id].countDataSources:0;
                  proj.projectListsCount = projectListInfo[proj._id]?projectListInfo[proj._id].counts:0;
                  proj.totalContacts  = projectListInfo[proj._id]?projectListInfo[proj._id].contacts:0;
                  proj.lastUpdate  = projectListInfo[proj._id]?projectListInfo[proj._id].lastdate:"";
              });
              res.status(200).send(results);
          });
      }).catch(err => {
          res.status(500).send({status: "error", response: err, message: "Unable to find projects for user"});
      });
    }
);

router.post('/',
    passport.authenticate('basic', {session: false}), function (req, res, next) {
        if (!req.body || !req.body.projectName) {
            res.status(400).send({status: "Bad Request", message: "No model provided."});
            next();
        }

        Projects.findOne({createdBy: req.user.id, name: req.body.projectName}).then(proj => {
            if (proj) {
                res.status(200).send({
                    status: "ok",
                    response: proj,
                    message: "Project already exists... but that's ok!"
                });
            } else {
                let one = new Projects();
                one.name = req.body.projectName;
                // one.city = req.body.city;
                // one.term = req.body.term;
                // one.dataSources = req.body.dataSources;
                // one.state = req.body.state;
                // one.industry = req.body.industry;
                // one.subindustry = req.body.subindustry;
                // one.subsubindustry = req.body.subsubindustry;
                // one.hasSubscriptions = req.body.hasSubscriptions;
                one.createdDate = one.updatedDate = new Date().toUTCString();
                one.createdBy = req.user._id;
                one.save().then(saved => {
                    res.status(200).send({status: "ok", response: saved, message: "Project saved."});
                }).catch(err => {
                    res.status(500).send({status: "error", response: err, message: "Unable to save project for user."});
                });
            }
        });
    }
);

router.post('/:id',
    passport.authenticate('basic', {session: false}), function (req, res, next) {
        if (!req.body || !req.params.id) {
            res.status(400).send({status: "Bad Request", message: "No model or id provided."});
            next();
        }

        let one = new Projects(req.body);
        one.updatedDate = new Date().toUTCString();
        one._id = req.params.id;

        Projects.updateOne({_id: req.params.id}, one).then(saved => {
            res.status(200).send({status: "ok", response: saved, message: "Project updated."});
        }).catch(err => {
            res.status(500).send({status: "error", response: err, message: "Unable to update project for user."});
        });
    }
);

router.get('/deleteproject/:projectId',
    passport.authenticate('basic', {session: false}), function (req, res, next) {
        if (!req.params.projectId) {
            res.status(400).send({status: "Bad Request", message: "No model or id provided."});
            next();
        }

        let projectId = req.params.projectId;
        Projects.find({_id: projectId}).remove().then(response => {
          ProjectLists.find({projectId: projectId}).remove().then(response => {
            res.status(200).send({status: "ok"});
          });
        });
    }
);


module.exports = router;
