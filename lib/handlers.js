/*
* Request handlers
*
*/

//Dependencies
var crud = require('./crud');

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
        crud.read('users', userID, function(err, data){
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
            };
        });
    } else{
        cb(300, {'error': 'missing mandatory fields'});
    };  
};

//users - get
handlers._users.GET = function(data, cb){
    //If the user exists, read it, otherwise throw err
    //console.log('querystring ', typeof(data.queryString.userID));
    var userID = typeof(data.queryString.userID) == 'string' && data.queryString.userID.trim().length > 0 ? data.queryString.userID.trim() : false;
    //console.log('querystring --', (userID)); 
    if (userID){
        crud.read('users', userID, function(err, data){
            if (!err && data){
                //User exists, build a json response, remove passwrd and display. 
                //The returned data type is a JSON string which must be parsed on cb
                //console.log('data type', typeof(data));
                cb(200, JSON.parse(data));  
            } else {
                cb(404, {'error': 'user not found', userID});
            };
        });

    } else {
        cb(400, {'error':'missing userID to query'});
    };
    
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
            //Check if the user exists
            crud.read('users', userID, function(err, data){
                if (!err && data){
                    //User exists, build a json updateObject, remove passwrd and display. 
                    //The returned data type is a JSON string which must be parsed on cb
                    //console.log('data type', typeof(data));
                    //cb(200, JSON.parse(data));
                    
                    var userObject = JSON.parse(data);
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

                    crud.update('users', userID, userObject, function(err, data){
                        if (!err){
                            cb(200, {'ok':'Successfully updated user', userID})
                        } else{
                            cb(500, {'error': 'could not update user', userID});
                        };
                    });                  
                } else {
                    cb(404, {'error': 'user not found', userID});
                };   
            });                      
        } else{
            cb(400, {'error': 'at least one field value must be provided'})
        }
    } else{
        cb(400, {'error':'UserID cannot be empty'});
    };
};

//users - delete
handlers._users.DELETE = function(data, cb){
    //If the user exists, read it, otherwise throw err
    //console.log('querystring ', typeof(data.queryString.userID));
    //check that required fields are filled in
    var userID = typeof(data.payload.userID) == 'string' && data.payload.userID.trim().length>0 ? data.payload.userID.trim() : false;

    //console.log(userID);

    if (userID){
        crud.read('users', userID, function(err, data){
            if (!err && data){
                //User exists, build a json updateObject, remove passwrd and display. 
                //The returned data type is a JSON string which must be parsed on cb
                console.log('data type', typeof(data));
                //cb(200, JSON.parse(data));
                
                crud.delete('users', userID, function(err){
                    if (!err){
                        cb(200, {'ok':'Successfully deleted user', userID})
                    } else{
                        cb(500, {'error': 'could not delete user', userID});
                    };
                });                  
            } else {
                cb(404, {'error': 'user not found', userID});
            };   
        });
    } else{
        cb(400, {'error':'UserID cannot be empty'});
    };
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

// //Tokens- post
// handlers._tokens.POST = function(data, cb){
//     //check that all required fields are filled in
//     var firstname = typeof(data.payload.firstname) == 'string' && data.payload.firstname.trim().length>0 ? data.payload.firstname.trim() : false;
//     var lastname = typeof(data.payload.lastname) == 'string' && data.payload.lastname.trim().length>0 ? data.payload.lastname.trim() : false;
//     var userID = typeof(data.payload.userID) == 'string' && data.payload.userID.trim().length>0 ? data.payload.userID.trim() : false;
//     var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
//     var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length>0 ? data.payload.password.trim() : false;
//     var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true  ? data.payload.tosAgreement : false;

//     if (firstname && lastname && userID && phone && password && tosAgreement){
//         //Check whether the user already exists
//         crud.read('users', userID, function(err, data){
//             if (err) {
//                 //User does not exist, create a new user request payload
//                 var userPayload = {
//                     'firstname': firstname,
//                     'lastname': lastname,
//                     'userID': userID,
//                     'phone' : phone,
//                     'password' : password,
//                     'tosAgreement' : tosAgreement
//                 }

//                 //Create a new user
//                 crud.create('users', userID, userPayload, function(err){
//                     if (!err) {
//                         cb(200, {'created new user': 'ok'})
//                     } else cb(500, {'error' :'could not create new user'});
//                 });

//             } else{
//                 cb(400, {'error':'user already exists'});
//             };
//         });
//     } else{
//         cb(300, {'error': 'missing mandatory fields'});
//     };  
// };

// //Tokens - get
// handlers._tokens.GET = function(data, cb){
//     //If the user exists, read it, otherwise throw err
//     //console.log('querystring ', typeof(data.queryString.userID));
//     var userID = typeof(data.queryString.userID) == 'string' && data.queryString.userID.trim().length > 0 ? data.queryString.userID.trim() : false;
//     //console.log('querystring --', (userID)); 
//     if (userID){
//         crud.read('users', userID, function(err, data){
//             if (!err){
//                 //User exists, build a json response, remove passwrd and display. 
//                 //The returned data type is a JSON string which must be parsed on cb
//                 //console.log('data type', typeof(data));
//                 cb(200, JSON.parse(data));  
//             } else {
//                 cb(404, {'error': 'user not found'});
//             };
//         });

//     } else {
//         cb(400, {'error':'missing userID to query'});
//     };
    
// };

// //Tokens - update
// handlers._tokens.PUT = function(data, cb){

// };

// //Tokens - delete
// handlers._tokens.DELETE = function(data, cb){

// };

module.exports = handlers;