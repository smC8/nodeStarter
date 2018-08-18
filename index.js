//Dependencies

var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var handlers = require ('./lib/handlers');
var helpers = require('./lib/helpers');

//Create an http server
//The server should respond to all requests with a string
var server = http.createServer( function (req, res){

    //get the URL, parse the path
    var parsedURL = url.parse(req.url, 'true');
    //console.log(parsedURL);

    //Parse path
    var path = parsedURL.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');
    // console.log(path);

    //Get the Query string as an object
    var queryString = parsedURL.query;
    console.log(typeof(queryString));

    //Parse the headers 
    var head = req.headers;
    // console.log(head);

    //Parse the method 
    var method = req.method;
    // console.log(method);

    //Parse the statuscode

    //Convert the buffer payload into utf-8 and parse it
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function(chunk){
        buffer += decoder.write(chunk);
    });
    req.on('end', function(){
        buffer += decoder.end();

        //jsoonBuffer = JSON.parse(buffer);
        //Remove JSON.parse(buffer) for any GET statements. THis should eventually be handled by 
        //helper function to parse string payloadinto JSON and empty string payloads into empty 
        //objects
        //Choose the handler this request should go to. If one doesnt exist, use default handler
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.default;
        console.log (router[trimmedPath]);
        //Construct the data object to send to the handler
        var data = {
            'payload': helpers.jsonParse(buffer),
            'trimmedPath': trimmedPath,
            'method' : method,
            'queryString': queryString,
            'headers': head
        };
        //var data = JSON.parse(data);
        console.log('index.js testing queries :datatype--', (data.queryString));
        //Route the request to the handler chosen above
        chosenHandler(data, function(status, payload){
            //Use the status code called back by the handler or default to 200
            status = typeof(status) == 'number' ? status : 200

            //Use the payload called back by the handler or default to empty object
            payload = typeof(payload) == 'object' ? payload : {};

            //Convert the payload to a string
            var payloadString = JSON.stringify(payload);

            //Send the response
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(status);
            res.end(payloadString);
            console.log('Server response', status, payloadString)
        });
    });
});


//Start the server, Listen to incoming requests
server.listen(2000, function(){
    console.log('serverlistening');
});

//Route requests based on path

var router = {
    'hello' : handlers.hello,
    'default' : handlers.default,
    'users' : handlers.users,
    'tokens': handlers.tokens
};