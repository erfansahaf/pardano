/**
 * Pardano.ir Node.js Module
 * @module Pardano
 * @author Erfan Sahafnejad <Erfan.Sahaf[at]gmail.com>
 * @copyright Pardano.ir 2017
 * @version 1.0.0
 * @license Apache-2.0
 */

function Pardano(token){
    this.isInitialized = false;
    if(token != '' && typeof token === 'string'){
        this.soap = require('soap');
        this.webservice = (token == 'test') ? "http://pardano.com/p/webservice-test/?wsdl" : "http://pardano.com/p/webservice/?wsdl";
        this.gateway = "http://pardano.com/p/payment/";
        this.token = token;
        this.isInitialized = true;
    }
    return this.isInitialized;
}

/**
 * Payment Request
 * 
 * @since 1.0.0
 * @param {number} amount Product price in Toman format
 * @param {string} url Your Callback URL to redirect user after doing transaction
 * @param {number} order_id Invoice number or order id
 * @param {string} description Details and description
 * @param {function} cb Your callback function to get payment link
 */
Pardano.prototype.sendRequest = function(amount, url, order_id, description, cb){
    var message = null, $this = this;

    if(!this.isInitialized)
        message = "Module wasn't initialized correctly.";
    
    else if(typeof amount != 'number' || amount < 100)
        message = "Price should be Integer and equals/greater than 100.";

    else if(url.length < 5)
        message = "Callback URL is required. (At least 5 chars)";

    else if(typeof order_id != 'number')
        message = "Order id should be Integer";

    else if(typeof description != 'string')
        message = "Description should be String.";
    
    if(message != null)
        return cb(message, null);
    
    
    var data = {
        api: this.token,
        amount,
        callbackurl: url,
        orderid: order_id,
        description
    }
    

    this.soap.createClient(this.webservice, function(soapErr, client) {
        if(soapErr)
            return cb("Somthing is wrong with Soap driver.", null);
        
        client.requestpayment(data, function(clientErr, result) {
            if(clientErr)
                return cb("Somthing is wrong with Pardano webservice.", null);
            
            responseCode = parseInt(result.return.$value);
            
            if(responseCode > 0)
                return cb(null, $this.gateway + responseCode);
            
            return cb(getErrorMessage(responseCode), null);
        });
    });
}

/**
 * Verify Request
 * 
 * @since 1.0.0
 * @param {object} req Your web framework request object
 * @param {number} amount Product price in Toman format
 * @param {function} cb Your callback function to get payment status
 */
Pardano.prototype.verifyRequest = function(req, amount, cb){

    if(!this.isInitialized)
        return cb(false,"Module wasn't initialized correctly.");

    else if(!req || req == "" || typeof req != 'object')
        return cb(false,"`req` parameter is not an object.");

    else if(typeof req.query.au === 'undefiend' || req.query.au == null || req.query.au == "" || req.query.au.length < 3 )
        return cb(false,"Authority number doesn't exist in req object or transaction was cancled.");

    else if(typeof amount != 'number' || amount < 100)
        return cb(false,"Price should be Integer and equals/greater than 100.");
        
    else {
        var data = {
            api: this.token,
            amount,
            authority: req.query.au
        }

        this.soap.createClient(this.webservice, function(soapErr, client) {
            if(soapErr)
                return cb(false, "Somthing is wrong with Soap driver.");
            
            else{
                client.verification(data, function(clientErr, result) {
                    if(clientErr)
                        return cb(false, "Somthing is wrong with Pardano webservice.");
                    else{
                        responseCode = parseInt(result.return.$value);
                        if(responseCode == 1)
                            return cb(true, null);
                        else if(responseCode < 1 || responseCode != 1)
                            return cb(false, getErrorMessage(responseCode));
                        else
                            return cb(false, "Uexpected error.");
                    }
                });
            }
        });
    }
}

function getErrorMessage(code){
    var message;
    switch(code){
        case -1:
            message = "API Key is invalid.";
            break;
        case -2:
            message = "Amount is less than minimum amount.";
            break;
        case -3:
            message = "Amount is greater than maximum amount.";
            break;
        case -4:
            message = "Amount is not valid.";
            break;
        case -6:
            message = "Your gateway is disabled.";
            break;
        case -7:
            message = "Your IP address is blocked.";
            break;
        case -9:
            message = "Callback URL is empty.";
            break;
        case -10:
            message = "Transaction not found.";
            break;
        case -11:
            message = "Transaction canceled.";
            break;
        case -12:
            message = "Transaction is done but price isn't matched.";
            break;
        case -13:
            message = "Transaction has verified before.";
            break;
        case -21:
            message = "Server's IP isn't same as declared in Pardano.ir";
            break;
        default:
            message = "Unexpected error: " + responseCode;
    }
    return message;
}

module.exports = Pardano;