'use strict';
/**
 *  * Created by wbsimms on 6/20/2017.
 */

var crypto = require('crypto');

function Crypto() {
    this.password = 'sdflkj23l4kjfslkj2w3lkjsfdo8sdf098lskfdj';
    this.algorithm = 'aes-256-ctr';

}

Crypto.prototype.encrypt = function(text){
    var cipher = crypto.createCipher(this.algorithm,this.password);
    var crypted = cipher.update(text,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
};

Crypto.prototype.decrypt = function(text){
    var decipher = crypto.createDecipher(this.algorithm,this.password);
    var dec = decipher.update(text,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
};

module.exports = Crypto;