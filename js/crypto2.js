'use strict';
/**
 *  * Created by wbsimms on 6/20/2017.
 */

let crypto = require('crypto');

function Crypto() {
    this.ALGORITHM = 'aes-256-cbr';
    this.HMAC_ALGORITHM = 'SHA256';
    this.KEY = "";
    this.HMAC_KEY = "";
}

Crypto.prototype.encrypt = function(text){
    let IV = new Buffer(crypto.randomBytes(16)); // ensure that the IV (initialization vector) is random
    let cipher_text;
    let hmac;
    let encryptor;

    encryptor = crypto.createCipheriv(this.ALGORITHM, this.KEY, IV);
    encryptor.setEncoding('hex');
    encryptor.write(text);
    encryptor.end();

    cipher_text = encryptor.read();

    hmac = crypto.createHmac(this.HMAC_ALGORITHM, this.HMAC_KEY);
    hmac.update(cipher_text);
    hmac.update(IV.toString('hex'));

    return cipher_text + "$" + IV.toString('hex') + "$" + hmac.digest('hex');
};

Crypto.prototype.decrypt = function(text){
    let cipher_blob = text.split("$");
    let ct = cipher_blob[0];
    let IV = new Buffer(cipher_blob[1], 'hex');
    let hmac = cipher_blob[2];
    let decryptor;

    let chmac = crypto.createHmac(this.HMAC_ALGORITHM, this.HMAC_KEY);
    chmac.update(ct);
    chmac.update(IV.toString('hex'));

    if (!this.constantTimeCompare(chmac.digest('hex'), hmac)) {
        console.log("Encrypted Blob has been tampered with...");
        return null;
    }

    decryptor = crypto.createDecipheriv(this.ALGORITHM, this.KEY, IV);
    let decryptedText = decryptor.update(ct, 'hex', 'utf-8');
    return decryptedText + decryptor.final('utf-8');
};

Crypto.prototype.constantTimeCompare = function(val1, val2) {
    let sentinel = "";

    if (val1.length !== val2.length) {
        return false;
    }

    for (let i = 0; i <= (val1.length - 1); i++) {
        sentinel |= val1.charCodeAt(i) ^ val2.charCodeAt(i);
    }

    return sentinel === 0
};


module.exports = Crypto;