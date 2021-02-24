'use strict';
let request = require('superagent-bluebird-promise');
let ProspectModel = require('../../js/integrations/prospectModel');


class Pardot {
    constructor(pardotSettings) {
        this.pardotConfig = {};
        this.pardotConfig.email = pardotSettings.email ;
        this.pardotConfig.password = pardotSettings.password ;
        this.pardotConfig.user_key = pardotSettings.userKey;
    }

    getApiKey() {
        return request
            .post('https://pi.pardot.com/api/login/version/4?'
                + 'email=' + this.pardotConfig.email
                + '&password=' + this.pardotConfig.password
                + '&user_key=' + this.pardotConfig.user_key
                + '&format=json', {})
            .then(res => {
                return res.body.api_key;
            });
    };

    upload(prospectModel) {
        return this.getApiKey().then(key => {
            let requestString = 'https://pi.pardot.com/api/prospect/version/4/do/create?'
                + 'format=json'
                + '&user_key=' + this.pardotConfig.user_key
                + '&api_key=' + key
                + '&first_name=' + prospectModel.firstName
                + '&last_name=' + prospectModel.lastName
                + '&company=' + prospectModel.company
                + '&job_title=' + prospectModel.jobTitle
                + '&city=' + prospectModel.city
                + '&state=' + prospectModel.state
                + '&zip=' + prospectModel.zip
                + '&phone=' + prospectModel.phone
                + '&address_one=' + prospectModel.address1
                + '&address_two=' + prospectModel.address2
                + '&website=' + prospectModel.website;

            if (prospectModel.email) {
                requestString = requestString + '&email=' + prospectModel.email;
            } else {
                requestString = requestString + '&email=' + "notfound@donotsend.com";
            }
            return request
                .post(requestString)
        })
        .then(res => {
            return res.ok;
        }).catch(err => {
            console.error(err);
            throw err;
        });
    };

}


module.exports = Pardot;