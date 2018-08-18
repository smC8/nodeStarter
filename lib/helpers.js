/*
* Helper functions
*
*/

//Dependencies

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



module.exports = helpers;