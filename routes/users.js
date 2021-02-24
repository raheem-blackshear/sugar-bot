const fs = require('fs');

let express = require('express');
let passport = require('passport');
let router = express.Router();
let Users = require('../js/dataAccess/models/users');
let Crypto = require('../js/crypto');
let MailService = require('../js/mailService');
let RouteUtils = require('../routes/routeUtil');
let routeUtils = new RouteUtils();
let passGen = require('pass-gen');

let ms = new MailService();

/* GET users listing. */
router.get('/',
  passport.authenticate('basic', {session: false}), function (req, res, next) {
    res.status(200).send(req.user);
  });

router.get('/all',
  passport.authenticate('basic', {session: false}), function (req, res, next) {
    Users.find({ role: { $ne: 'admin' } }, function (err, user) {
      res.status(200).send(user);
    });
  });

router.post('/update',
  passport.authenticate('basic', {session: false}), function (req, res, next) {
    Users.findByIdAndUpdate(req.user._id, {
      $set: {
        logo: req.body.logo,
        fullName: req.body.fullName,
        company: req.body.company,
        state: req.body.state,
        city: req.body.city,
        zipcode: req.body.zipcode,
        address: req.body.address,
        affiliation: req.body.affiliation,
        emailAddress: req.body.emailAddress,
        dateOfBirth: req.body.dateOfBirth,
        phoneNumber: req.body.phoneNumber,
        updatedDate: new Date().toUTCString(),
      }}).then(response => {
      res.status(200).send({status: "ok", message: "Profile saved."});
    }).catch(err => {
      console.error(err);
      res.status(500).send({status: "error", response: err, message: "Unable to save your profile."})
    });
  });

router.post('/updateCoupon',
    passport.authenticate('basic', {session: false}), function (req, res, next) {
      Users.findByIdAndUpdate(req.user._id, {
        $set: {
          coupons: req.body.coupons,
        }}).then(response => {
        res.status(200).send({status: "ok", message: "User coupons updated."});
      }).catch(err => {
        console.error(err);
        res.status(500).send({status: "error", response: err, message: "Unable to update your coupons."})
      });
    });
router.post('/updateCredit',
    passport.authenticate('basic', {session: false}), function (req, res, next) {
      Users.findByIdAndUpdate(req.user._id, {
        $set: {
          credit: req.body.credits,
        }}).then(response => {
        res.status(200).send({status: "ok", message: "User credits updated."});
      }).catch(err => {
        console.error(err);
        res.status(500).send({status: "error", response: err, message: "Unable to update your credits."})
      });
    });
router.post('/updatePurchasedList',
    passport.authenticate('basic', {session: false}), function (req, res, next) {
      Users.findByIdAndUpdate(req.user._id, {
        $set: {
          purchasedListIds: req.body.listIds,
        }}).then(response => {
        res.status(200).send({status: "ok", message: "User purchased list updated."});
      }).catch(err => {
        console.error(err);
        res.status(500).send({status: "error", response: err, message: "Unable to update your credits."})
      });
    });
router.post('/active',
    passport.authenticate('basic', {session: false}), function (req, res, next) {
      Users.findByIdAndUpdate(req.body.userId, {
        $set: {
          active: req.body.active,
        }}).then(response => {
        res.status(200).send({status: "ok"});
      }).catch(err => {
        console.error(err);
        res.status(500).send({status: "error", response: err, message: "Unable to update status."})
      });
    });
router.post('/reopen',
    passport.authenticate('basic', {session: false}), function (req, res, next) {
      Users.findByIdAndUpdate(req.body.userId, {
        $set: {
          closed: 0,
        }}).then(response => {
        res.status(200).send({status: "ok"});
      }).catch(err => {
        console.error(err);
        res.status(500).send({status: "error", response: err, message: "Unable to update status."})
      });
    });
router.get('/close',
    passport.authenticate('basic', {session: false}), function (req, res, next) {
      Users.findByIdAndUpdate(req.user._id, {
        $set: {
          closed: 1,
        }}).then(response => {
        res.status(200).send({status: "ok"});
      }).catch(err => {
        console.error(err);
        res.status(500).send({status: "error", response: err, message: "Unable to update your coupons."})
      });
    });

router.get('/subscribe/:dataSourceId',passport.authenticate('basic', {session: false}), function (req, res, next) {
    if (!req.params.dataSourceId) {
        res.status(400).send("dataSourceId required.");
        next();
    }
    Users.findById(req.user.id).then(user => {
        user.addSubscription(req.params.dataSourceId).then(response =>{
            res.status(200).send({response: response, status: "ok"});
            });
    }).catch(err => {
        console.error(err);
        res.status(500).send({status: "error", response: err, message: "Unable to add subscription."});
    });
});

router.get('/unsubscribe/:dataSourceId',passport.authenticate('basic', {session: false}), function (req, res, next) {
    if (!req.params.dataSourceId) {
        res.status(400).send("dataSourceId required.");
        next();
    }
    Users.findById(req.user.id).then(user => {
        user.removeSubscription(req.params.dataSourceId).then(response =>{
            res.status(200).send({response: response, status: "ok"});
        });
    }).catch(err => {
        console.error(err);
        res.status(500).send({status: "error", response: err, message: "Unable to remove subscription."});
    });
});

router.post('/updateBillingInformation',
    passport.authenticate('basic', {session: false}), function (req, res, next) {
        Users.findByIdAndUpdate(req.user._id, {
            $set: {
                billingInformation: {
                    fullName: req.body.fullNameBilling,
                    address1: req.body.address1,
                    address2: req.body.address2,
                    city: req.body.city,
                    state: req.body.state,
                    zip: req.body.zip
                }
            }}).then(response => {
            res.status(200).send({status: "ok", message: "Profile saved."});
        }).catch(err => {
            console.error(err);
            res.status(500).send({status: "error", response: err, message: "Unable to save your profile."})
        });
    });

router.post('/upload/image',
    passport.authenticate('basic', {session: false}), function (req, res, next) {
      if(req.body.image.indexOf('data:image')<0) {
        res.status(200).send({status: "ok", url: req.body.image});
      } else {
        let base64Data = req.body.image.split("base64,")[1];
        let filename = new Date().getTime() + ".png";
        fs.writeFile('../public/images/uploads/'+filename, base64Data, 'base64', function(err) {
        // require("fs").writeFile('public/images/uploads/'+filename, base64Data, 'base64', function(err) {
          let protocol = (req.connection.encrypted) ? "https://" : "http://";
          let url = protocol + req.headers.host+'/images/uploads/'+filename;
          console.log('upload image url: ' + url);
          res.status(200).send({status: "ok", url: url, error: err});
        });
      }
    });

router.post('/addStripeId',
    passport.authenticate('basic', {session: false}), function (req, res, next) {
        Users.findByIdAndUpdate(req.user._id, {
            $set: {
                stripeId: req.body.stripeId
            }}).then(response => {
            res.status(200).send({status: "ok", message: "Profile saved."});
        }).catch(err => {
            console.error(err);
            res.status(500).send({status: "error", response: err, message: "Unable to save your profile."})
        });
    });

router.post('/updatePassword',
    passport.authenticate('basic', {session: false}), function(req, res, next) {
        let encryptedOldPassword = new Crypto().encrypt(req.body.oldpassword);
        let encryptedPassword = new Crypto().encrypt(req.body.newpassword);
        if(encryptedOldPassword != req.user.password)
            res.status(200).send({status: "error", message: "Old password is incorrect." });
        else {
            Users.findByIdAndUpdate(req.user._id, {
                $set: {
                    //password
                     password: encryptedPassword
                }
            }).then(response => {
                res.status(200).send({status: "ok", message: "Password saved.", password: encryptedPassword});
            }).catch(err => {
                console.error(err);
                res.status(500).send({status: "error", response: err, message: "Unable to save your password."})
            });
        }
    });

router.get('/verify/:userId', function (req, res, next) {
    Users.findByIdAndUpdate(req.params.userId,{verified: true, active: true}).then(user => {
        routeUtils.sendOk(res,{},"Account verified.");
    }).catch(err => {
        console.error(err);
        routeUtils.sendError(res,err,"Unable to verify account.");
    });
});


router.post('/updatePardot',
    passport.authenticate('basic', {session: false}), function(req, res, next) {
        Users.findByIdAndUpdate(req.user._id, {
            $set: {
                integrations: {
                    pardot: {
                        email: req.body.email,
                        userKey: req.body.key,
                        password: req.body.password // encrypt this!
                    }
                }
            }
        }).then(response => {
            res.status(200).send({status: "ok", message: "Settings saved." });
        }).catch(err => {
            console.error(err);
            res.status(500).send({status: "error", response: err, message: "Unable to save your settings."})
        });
    });

router.get('/hasPardot',
    passport.authenticate('basic', {session: false}),
    function(req, res, next) {
        Users.findById(req.user.id,{integrations: 1}).then(user => {
            if (user.integrations && user.integrations.pardot && user.integrations.pardot.userKey) {
                routeUtils.sendOk(res, {hasPardot: true});
            } else
            {
                routeUtils.sendOk(res,{hasPardot: false});
            }
        }).catch(err => {
            console.error(err);
        });
    });

router.get('/passwordReset/:emailAddress',
    function(req, res, next) {
        if (!req.params.emailAddress) {
            routeUtils.sendBadRequest(res,"No email address provided");
            return;
        }

        Users.findOne({emailAddress: req.params.emailAddress}).then(user => {
            if (user) {
                let newPassword = passGen(['ascii', 'ASCII', 'numbers'], 10);
                user.password = new Crypto().encrypt(newPassword);
                user.save().then(ignore => {
                    ms.sendEmail('admin@sugarbottomstudios.com', 'SugarBotAdmin', 'SugarBot Password Reset', 'Your password has been reset to the following: ' +
                        newPassword, [req.params.emailAddress]).then(response => {
                        routeUtils.sendOk(res, {message: "We sent a new password to address provided."});
                    });

                });
            } else {
                routeUtils.sendOk(res, {message: "We sent a new password to address provided."});
            }
        }).catch(err => {
            console.error(err);
            routeUtils.sendError(res,err, "Unable to reset the users password");
        });
    });

router.post('/help',
    passport.authenticate('basic', {session: false}), function(req, res, next) {
        ms.sendEmail(req.body.email, req.body.name, req.body.subject, req.body.message, ["hello@sugarbot.com"]).then(response => {
            res.status(200).send({status: "success", message: "Message has been sent." });
        }).catch(err => {
            routeUtils.sendError(res,err, "Unable to send message");
        });
    });

module.exports = router;
