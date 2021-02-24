'use strict';

let config = require('../mailjet.json');
let Mailjet = require('node-mailjet').connect(config.apikey, config.apisecret);
let _ = require('lodash');


class MailService {
    constructor() {
        this.sendMail = Mailjet.post('send', {'version': 'v3.1'});
    }

    sendEmail(fromEmail,fromName,subject,text,recipients) {
        let emailData = {
          "Messages":[
      				{
      						"From": {
      								"Email": "myles@sugarbot.com",
      								"Name": fromName
      						},
      						"To": [],
      						"Subject": subject,
      						"TextPart": text
      				}
      		]
        };

        _.each(recipients,function(one){
            emailData.Messages[0].To.push({'Email' : one})
        });

        return this.sendMail.request(emailData);
    }

    sendEmailBlaster(fromEmail,fromName,subject,html,recipients) {
        let emailData = {
      		"Messages":[
      				{
      						"From": {
      								"Email": "myles@sugarbot.com",
      								"Name": fromName + "<" + fromEmail + ">"
      						},
      						"To": [],
      						"Subject": subject,
      						"HTMLPart": html
      				}
      		]
      	};

        _.each(recipients,function(one){
            emailData.Messages[0].To.push({'Email' : one})
        });

        return this.sendMail.request(emailData);
    }
}

module.exports = MailService;
