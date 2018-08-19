/*
* Helper functions
*
*/

//Dependencies
var crypto = require('crypto');
var config = require('./config');
var querystring = require('querystring');
var https = require ('https');

var helpers = {};

//Parse JSON string to an object without throwing
helpers.jsonParse = function(data){
    try{
        var jsonObject = JSON.parse(data)
        return (jsonObject);
    } catch(err){
        return {};
    };
};

//Create a SHA-256 hash
helpers.hash = function(data){
    if (typeof(data) == 'string' && (data.length > 0)){
        var hash = crypto.createHash('sha256', config.HashingSecret).update(data).digest('base64');
        return hash;
    } else{
        return false;
    }
 };

//Create a random string of specified length 
helpers.createRandomString = function(strlength){
    strlength = typeof(strlength) == 'number' && strlength > 0 ? strlength : false;
    if (strlength){
        //do smthng
        //Define a dictionary of all possible values
        var dictionary = 'abcdefghijklmnopqrstuvwxyz0123456789';

        //Start the final string
        var str = '';
        for (i=1; i<=strlength; i++){
            randstring = dictionary.charAt(Math.floor(Math.random() * dictionary.length));
            str += randstring;
        }

        //Return the final string
        return str;
    } else{
        return false;
    }
};

//Sens an SMS via Twilio
helpers.sendTwilioSms = function(toPhone, msg, cb){
    //Validate parameters
    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
    msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;
    if(phone && msg){
        //Configure the request payload
        var payload ={
            'From' : config.twilio.fromPhone,
            'To' : '+1'+phone,
            'Body' : msg
        }
        //Stringify the payload. JSON stringify is not used because the content type is not json in request
        var payloadString = querystring.stringify(payload);

        //Configure the request details
        var requestDetails = {
            'protocol' : 'https:',
            'hostname' : 'api.twilio.com',
            'method' : 'POST',
            'path' : '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
            'auth' : config.twilio.accountSid+':'+config.twilio.authToken,
            'headers' : {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Content-Length' : Buffer.byteLength(payloadString, 'utf8')
            }
        };

        //Instantiate the request object
        var req = https.request(requestDetails, function(res){
            //Grab the status of the sent request
            var status = res.statusCode;
            //Callback successfully if the request went through
            if(status == 200 || status == 201){
                //great sucksex
                cb(false);
            } else{
                cb('error: status code returned was', status);
            }
        });

        //Bind to the error event so it doesnt get thrown
        req.on('error', function(e){
            cb(e);
        });

        //Add the payload to the request
        req.write(payloadString);

        //End the request
        req.end()
        //Send message
    } else{
        cb('invalid parameters');
    }
};


//Send a payment via Stripe
helpers.sendStripePayment = function(){

};


//Send en email via ------
helpers.sendMonkeyEmail = function(){

};

module.exports = helpers;