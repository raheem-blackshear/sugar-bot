'use strict';
/**
 * Created by vahan on 4/11/2019.
 */
let stripeConfig = require('../stripe.json');
//
if (process.env.NODE_ENV === 'development') {
    stripeConfig = require('../stripe-prod.json');
}

let express     = require('express');
let router      = express.Router();
let axios       = require('axios');
let passport    = require('passport');
let DataSources = require('../js/dataAccess/models/dataSources');
let Users       = require('../js/dataAccess/models/users');
let _           = require('lodash');
const stripeKey = stripeConfig.secretKey;
let stripe      = require("stripe")(stripeKey);

router.post('/addPaymentMethod',
	passport.authenticate('basic', {session: false}), function (req, res, next) {
		let email = req.body.email;
    let token = req.body.token;
    let customerId = req.body.customerId;
    stripe.customers.createSource(customerId,
      { source: token },
      function(err, card) {
        // asynchronously called
        stripe.customers.retrieve(customerId,
          function(err, customer) {
            // asynchronously called
            res.status(200).send({status: "success", data: customer});
          }
        );
      }
    ).catch(err => {
        res.status(400).send({status: "error", response: err, message: "Unable to add payment method."});
    });
	}
);

router.post('/getCustomer',
	passport.authenticate('basic', {session: false}), function (req, res, next) {
      stripe.customers.retrieve(req.body.customerId,
        function(err, customer) {
          // asynchronously called
          // if(customer)
            res.status(200).send({status: "success", data: customer});
          // else {
          //   stripe.customers.create(
          //     {
          //       email: req.user.emailAddress
          //     },
          //     function(err, customer) {
          //       res.status(200).send({status: "success", data: customer});
          //     }
          //   )
          // }
        }
      );
	}
);

router.post('/getInvoices',
	passport.authenticate('basic', {session: false}), function (req, res, next) {
      stripe.invoices.list(
        {
          limit: 100,
          customer: req.body.customerId
        },
        function(err, invoices) {
          // asynchronously called
          res.status(200).send({status: "success", data: invoices});
        }
      );
	}
);

router.post('/getCharges',
	passport.authenticate('basic', {session: false}), function (req, res, next) {
      stripe.charges.list(
        {
          limit: 100,
          customer: req.body.customerId
        },
        function(err, charges) {
          // asynchronously called
          res.status(200).send({status: "success", data: charges});
        }
      );
	}
);

router.get('/getCharges',
    passport.authenticate('basic', {session: false}), function (req, res, next) {
      stripe.charges.list(
        { limit: 1000 },
        function(err, charges) {
          // asynchronously called
          console.log(err);
          res.status(200).send({status: "success", data: charges});
        }
      );
    }
);

router.get('/getCoupons',
    passport.authenticate('basic', {session: false}), function (req, res, next) {
      stripe.coupons.list(
        {limit: 100},
        function(err, coupons) {
          // asynchronously called
          res.status(200).send({status: "success", data: coupons});
        }
      );
    }
);

router.get('/getTaxrates',
    passport.authenticate('basic', {session: false}), function (req, res, next) {
      let options = {
          headers: {'Authorization': 'Bearer ' + stripeKey}
      };
      axios.get('https://api.stripe.com/v1/tax_rates?limit=100', options)
      .then(response => {
        return res.status(200).send({status: "success", data: response.data});
      });
      // res.status(200).send({status: "success", data: []});
    }
);

router.post('/createSubscription',
	passport.authenticate('basic', {session: false}), function (req, res, next) {
      if(req.body.token) {
        stripe.customers.createSource(req.body.customerId,
          { source: req.body.token },
          function(err, card) {
            // asynchronously called
            stripe.subscriptions.create(
              {
                customer: req.body.customerId,
                items: req.body.plan,
                default_tax_rates: [req.body.taxId]
              },
              function(err, subscription) {
                // console.log(err);
                // console.log(subscription);
                // asynchronously called
                res.status(200).send({status: "success", data: subscription});
              }
            );
          }
        ).catch(err => {
            res.status(400).send({status: "error", response: err, message: "Unable to add payment method."});
        });
      } else {
        stripe.subscriptions.create(
          {
            customer: req.body.customerId,
            items: req.body.plan,
            default_tax_rates: [req.body.taxId]
          },
          function(err, subscription) {
            // console.log(err);
            // console.log(subscription);
            // asynchronously called
            res.status(200).send({status: "success", data: subscription});
          }
        );
      }
	}
);

router.post('/removeSubscription',
	passport.authenticate('basic', {session: false}), function (req, res, next) {
      stripe.subscriptions.del(
        req.body.subscriptionId,
        function(err, confirmation) {
          // asynchronously called
          res.status(200).send({status: "success", data: confirmation});
        }
      );
	}
);

router.post('/removeMethod',
	passport.authenticate('basic', {session: false}), function (req, res, next) {
      stripe.customers.deleteSource(
        req.body.customerId,
        req.body.sourceId,
        function(err, confirmation) {
          // asynchronously called
          res.status(200).send({status: "success", data: confirmation});
        }
      );
	}
);

router.post('/createCharges',
	passport.authenticate('basic', {session: false}), function (req, res, next) {
		let priceTotal = req.body.totalPrice;
		let token = req.body.token;
		let crncy = req.body.currency;
		let desc = req.body.description;
    if(token) {
      stripe.customers.createSource(req.body.customerId,
        { source: req.body.token },
        function(err, card) {
          console.log(err);
          // asynchronously called
          stripe.charges.create(
        			{
          			amount: priceTotal,
          			currency: 'usd',
                customer: req.body.customerId
        			},
        			function(err, charge) {
                console.log(err);
        				if (charge) {
      	  				if (charge.status == 'succeeded') {
      						    res.status(200).send({status: "success", data: charge});
      	  				}
        				}
        			}
      		);
        }
      ).catch(err => {
          res.status(400).send({status: "error", response: err, message: "Unable to add payment method."});
      });
    } else {
      stripe.charges.create(
    			{
      			amount: priceTotal,
      			currency: 'usd',
            customer: req.body.customerId
    			},
    			function(err, charge) {
    				if (charge) {
  	  				if (charge.status == 'succeeded') {
  						    res.status(200).send({status: "success", data: charge});
  	  				}
    				}
    			}
  		);
    }
	}
);

module.exports = router;
