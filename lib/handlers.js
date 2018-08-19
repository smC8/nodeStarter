/*
* Request handlers
*
*/

//Dependencies
var crud = require('./crud');
var helpers = require('./helpers');

//Create handlers to handle requests to different paths
var handlers = {};

handlers.hello = function(data, cb){
    cb(200, {'hi': 'there!'});
};

handlers.default = function(data, cb){
    cb(404, {'not': 'found'});
};

//Define handlers for user account actions
handlers.users = function(data, cb){
    var acceptableMethods = ['POST', 'GET', 'PUT', 'DELETE'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        //do smthng
        //console.log(data.method);
        //console.log(typeof(data.queryString.userID));
        handlers._users[data.method](data, cb);
    } else {
        console.log('handlers.users: ', data.method);
        //console.log(data.payload.userID);
        cb(405);
    }   
};
//
//Container for the user's sub-methods
handlers._users = {};

//Users- post
handlers._users.POST = function(data, cb){
    //check that all required fields are filled in
    var firstname = typeof(data.payload.firstname) == 'string' && data.payload.firstname.trim().length>0 ? data.payload.firstname.trim() : false;
    var lastname = typeof(data.payload.lastname) == 'string' && data.payload.lastname.trim().length>0 ? data.payload.lastname.trim() : false;
    var userID = typeof(data.payload.userID) == 'string' && data.payload.userID.trim().length>0 ? data.payload.userID.trim() : false;
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length>0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true  ? data.payload.tosAgreement : false;

    if (firstname && lastname && userID && phone && password && tosAgreement){
        //Check whether the user already exists
        crud.read('users', userID, function(err, userData){
            if (err) {
                //User does not exist, create a new user request payload
                var userPayload = {
                    'firstname': firstname,
                    'lastname': lastname,
                    'userID': userID,
                    'phone' : phone,
                    'password' : password,
                    'tosAgreement' : tosAgreement
                }

                //Create a new user
                crud.create('users', userID, userPayload, function(err){
                    if (!err) {
                        cb(200, {'ok': 'created new user', userID});
                    } else{
                        cb(500, {'error' :'could not create new user', userID});
                    } 
                });

            } else{
                cb(400, {'error':'user already exists', userID});
            }
        });
    } else{
        cb(300, {'error': 'missing mandatory fields'});
    }  
};

//users - get
handlers._users.GET = function(data, cb){
    //If the user exists, read it, otherwise throw err
    //console.log('querystring ', typeof(data.queryString.userID));
    var userID = typeof(data.queryString.userID) == 'string' && data.queryString.userID.trim().length > 0 ? data.queryString.userID.trim() : false;
    //console.log('querystring --', (userID)); 
    if (userID){

        //Get the token from the header to verify if the user has sufficient rights to make this query
        var token = typeof(data.headers.tokenid) == 'string' && data.headers.tokenid.trim().length > 0 ? data.headers.tokenid.trim() : false;
        //console.log('handlers._users.GET -> data', data.headers);
        console.log('handlers._users.GET -> token inheader', token);
        //Verify token validity
        handlers._tokens.verifyToken(token, userID, function(tokenIsValid){
            if(tokenIsValid){
                //Token is valid, proceed with the query
                crud.read('users', userID, function(err, userData){
                    if (!err && data){
                        //User exists, build a json response, remove passwrd and display. 
                        //The returned data type is a JSON string which must be parsed on cb
                        console.log('data type', typeof(userData));
                        cb(200, JSON.parse(userData));  
                    } else {
                        cb(404, {'error': 'user not found', userID});
                    }
                });
            } else{
                cb(400, {'error' : 'missing token in header or token is invalid'});
            }
        });
        
    } else {
        cb(400, {'error':'missing userID to query'});
    }
    
};

//users - update
handlers._users.PUT = function(data, cb){
    //If the user exists, read it, otherwise throw err
    //console.log('querystring ', typeof(data.queryString.userID));
    //check that required and optional fields are filled in
    var firstname = typeof(data.payload.firstname) == 'string' && data.payload.firstname.trim().length>0 ? data.payload.firstname.trim() : false;
    var lastname = typeof(data.payload.lastname) == 'string' && data.payload.lastname.trim().length>0 ? data.payload.lastname.trim() : false;
    var userID = typeof(data.payload.userID) == 'string' && data.payload.userID.trim().length>0 ? data.payload.userID.trim() : false;
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length>0 ? data.payload.password.trim() : false;

    //console.log(userID);

    if (userID){
        //Check whether optional fields are provided
        if (firstname || lastname || phone || password){
            //Do smthng
            //Get the token from the header to verify if the user has sufficient rights to make this query
            var token = typeof(data.headers.tokenid) == 'string' && data.headers.tokenid.trim().length > 0 ? data.headers.tokenid.trim() : false;
            //Verify token validity
            handlers._tokens.verifyToken(token, userID, function(tokenIsValid){
                if(tokenIsValid){
                    //Token is valid, proceed with the query
                    //Check if the user exists
                    crud.read('users', userID, function(err, userData){
                        if (!err && userData){
                            //User exists, build a json updateObject, remove passwrd and display. 
                            //The returned data type is a JSON string which must be parsed on cb
                            //console.log('data type', typeof(data));
                            //cb(200, JSON.parse(data));
                    
                            var userObject = JSON.parse(userData);
                            //console.log('ee dekho', userObject);

                            if (firstname){
                                userObject.firstname = firstname;                        
                            }
                            if (lastname){
                                userObject.lastname = lastname;                        
                            }
                            if (phone){
                                userObject.phone = phone;                        
                            }
                            if (password){
                                userObject.password = password;
                            }

                            crud.update('users', userID, userObject, function(err){
                                if (!err){
                                    cb(200, {'ok':'Successfully updated user', userID});
                                } else{
                                    cb(500, {'error': 'could not update user', userID});
                                }
                            });                  
                        } else {
                            cb(404, {'error': 'user not found', userID});
                        }   
                    });
                } else{
                    cb(400, {'error' : 'missing token in header or token is invalid'});
                }                                                     
            }); 
        } else{
            cb(400, {'error': 'at least one field value must be provided'})
        }
    } else{
        cb(400, {'error':'UserID cannot be empty'});
    }
};

//users - delete
handlers._users.DELETE = function(data, cb){
    //If the user exists, read it, otherwise throw err
    //console.log('querystring ', typeof(data.queryString.userID));
    //check that required fields are filled in
    var userID = typeof(data.queryString.userID) == 'string' && data.queryString.userID.trim().length>0 ? data.queryString.userID.trim() : false;

    //console.log(userID);

    if (userID){
        //Get the token from the header to verify if the user has sufficient rights to make this query
        var token = typeof(data.headers.tokenid) == 'string' && data.headers.tokenid.trim().length > 0 ? data.headers.tokenid.trim() : false;
        //Verify token validity
        handlers._tokens.verifyToken(token, userID, function(tokenIsValid){
            if(tokenIsValid){
                //Token is valid, proceed with the query
                //Check if the user exists
                crud.read('users', userID, function(err, userData){
                    if (!err && userData){
                        //User exists, build a json updateObject, remove passwrd and display. 
                        //The returned data type is a JSON string which must be parsed on cb
                        console.log('data type', typeof(userData));
                        //cb(200, JSON.parse(data));
                        
                        crud.delete('users', userID, function(err){
                            if (!err){
                                cb(200, {'ok':'Successfully deleted user', userID})
                            } else{
                                cb(500, {'error': 'could not delete user', userID});
                            }
                        });                  
                    } else {
                        cb(404, {'error': 'user not found', userID});
                    }   
                });

            } else{
                cb(400, {'error' : 'missing token in header or token is invalid'});
            }
        });
        
    } else{
        cb(400, {'error':'UserID cannot be empty'});
    }
};



//Define handlers for session tokens
handlers.tokens = function(data, cb){
    var acceptableMethods = ['POST', 'GET', 'PUT', 'DELETE'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        //do smthng
        //console.log(data.method);
        //console.log(typeof(data.queryString.userID));
        handlers._tokens[data.method](data, cb);
    } else {
        console.log(data.method);
        //console.log(data.payload.userID);
        cb(405);
    }   
};

//Container for the token's sub-methods
handlers._tokens = {};

// Tokens- post
handlers._tokens.POST = function(data, cb){
    //check that all required fields are filled in
    var userID = typeof(data.payload.userID) == 'string' && data.payload.userID.trim().length>0 ? data.payload.userID.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length>0 ? data.payload.password.trim() : false;

    if (userID && password){
        //Check whether the user already exists
        crud.read('users', userID, function(err, userData){
            if (!err && userData) {
                //parse json string into object
                var userObject = helpers.jsonParse(userData);
                //User exists, validate password
                if (password == userObject.password){
                    //do smthng
                    //Create a new token with a random name, Set expiration date 1 hour in the future
                    var tokenID = helpers.createRandomString(128);
                    var expires = Date.now() + 1000 * 60 * 60 ;

                    //Store tokenID and timeout as a token Object
                    var tokenObject = {
                        'userID' : userID,
                        'tokenID' : tokenID,
                        'expires' : expires
                    };

                    //Store the token as a JSON object in the tokens directory
                    crud.create('tokens', tokenID, tokenObject, function(err){
                        if (!err) {
                            cb(200, {'ok' : 'created new token', tokenObject});
                        } else{
                            cb(500, {'error' :'could not create new token'});
                        } 
                    });
                } else{
                    cb(400, {'error': 'incorrect password'});
                }
            } else{
               cb(400, {'error':'user does not exist'});
            }
        });
    } else{
        cb(300, {'error': 'missing mandatory fields'});
    }  
};

//Tokens - ge
//Accepts tokenID and returns the token obhect
handlers._tokens.GET = function(data, cb){
    //If the user exists, read it, otherwise throw err
    //console.log('querystring ', typeof(data.queryString.tokenID));
    var tokenID = typeof(data.queryString.tokenID) == 'string' && data.queryString.tokenID.trim().length > 0 ? data.queryString.tokenID.trim() : false;
    //console.log('querystring --', (tokenID)); 
    if (tokenID){
        crud.read('tokens', tokenID, function(err, tokenData){
            if (!err && tokenData){
                //User exists, build a json response, remove passwrd and display. 
                //The returned data type is a JSON string which must be parsed on cb
                //console.log('data type', typeof(tokenData));
                cb(200, JSON.parse(tokenData));  
            } else {
                cb(404, {'error': 'token not found'});
            }
        });

    } else {
        cb(400, {'error':'missing tokenID to query'});
    }
    
};

//Tokens - update
//Accepts tokenID, extend to modify expiration time
handlers._tokens.PUT = function(data, cb){
    //If the token exists, read it, otherwise throw err
    //console.log('querystring ', typeof(data.queryString.tokenID));
    var tokenID = typeof(data.payload.tokenID) == 'string' && data.payload.tokenID.trim().length>0 ? data.payload.tokenID.trim() : false;
    var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true  ? data.payload.extend : false;

    //console.log('extend---',extend);
    //tokenID passed and extend request sent
    if (tokenID && extend){
        //Do smthng
        //Check if the user exists
        crud.read('tokens', tokenID, function(err, tokenData){
            if (!err && tokenData){
                //Token exists, build a json updateObject, remove passwrd and display. 
                //The returned data type is a JSON string which must be parsed on cb
                //console.log('data type', typeof(data));
                //cb(200, JSON.parse(data));
                    
                var tokenObject = JSON.parse(tokenData);
                //console.log('ee dekho', tokenObject);
                //Check if the token has expired or not
                if (tokenObject.expires > Date.now()){
                    
                    //Extend the token expiry time
                    tokenObject.expires = Date.now() + 1000 * 60 * 60;

                    //Save updated token data
                    crud.update('tokens', tokenID, tokenObject, function(err){
                        if (!err){
                            cb(200, {'ok':'Successfully updated token', tokenObject})
                        } else{
                            cb(500, {'error': 'could not update token', tokenID});
                        }
                    });
                } else{
                    cb(400, {'error': 'Token has already expired. Create a new one'});
                }

            } else {
                cb(404, {'error': 'token not found', tokenID});
            }   
        });
    } else{
        cb(400, {'error':'Missing required fields - TokenID & extend'});
    }
};

//Tokens - delete
handlers._tokens.DELETE = function(data, cb){
    //If the token exists, read it, otherwise throw err
    //console.log('querystring ', typeof(data.queryString.tokenID));
    //check that required fields are filled in
    var tokenID = typeof(data.queryString.tokenID) == 'string' && data.queryString.tokenID.trim().length>0 ? data.queryString.tokenID.trim() : false;

    //console.log(tokenID);

    if (tokenID){
        crud.read('tokens', tokenID, function(err, tokenData){
            if (!err && tokenData){
                //User exists, build a json updateObject, remove passwrd and display. 
                //The returned data type is a JSON string which must be parsed on cb
                console.log('data type', typeof(tokenData));
                //cb(200, JSON.parse(data));
                
                crud.delete('tokens', tokenID, function(err){
                    if (!err){
                        cb(200, {'ok':'Successfully deleted token', tokenID})
                    } else{
                        cb(500, {'error': 'could not delete token', tokenID});
                    }
                });                  
            } else {
                cb(404, {'error': 'user not found', tokenID});
            }   
        });
    } else{
        cb(400, {'error':'tokenID cannot be empty'});
    }

};

//Verify if a given tokenID is valid for the current user
handlers._tokens.verifyToken = function(tokenID, userID, cb){
    //Lookup the token to verify that it works for userID
    console.log('handlers._tokens.verifyToken -> Starting verification entering crud.read', tokenID, userID);
    crud.read('tokens', tokenID, function(err, tokenData){
        //Token exists
        if (!err && tokenData){
            tokenObject = helpers.jsonParse(tokenData);
            console.log('handlers._tokens.verifyToken -> data typeof token ',typeof(tokenObject));
            //Verify token validity and expiry 
            if(tokenObject.userID == userID && tokenObject.expires > Date.now()){
                console.log('token is valid');
                cb(true);
            } else{
                console.log( 'token invalid');
                cb(false);               
            }
        } else {
            cb(false);
        }        
    });
};

module.exports = handlers;

// if(!err && tokenData){
//     tokenObject = JSON.parse(tokenData);
//     //Verify token validity and expiry
//     if(tokenObject.userID == userID && tokenObject.expires > Date.now()){
//         console.log('resp1');
//         cb(true);
//     } else{
//         cb(false);
//     }


// } else{
//     console.log('resp2');
//     cb(false);

// }