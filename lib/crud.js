/*
* Library for storing and editing data
*
*/


//Dependencies
var fs = require ('fs');
var path = require('path');

//Define the crud object
var crud = {};

//Base directory of the data folder
crud.baseDir = path.join(__dirname, '/../.data');
console.log (crud.baseDir);
//Create the file
crud.create = function (dirName, file, data, cb){

    //Open the file for writing to
    fs.open(crud.baseDir+'/'+dirName+'/'+file+'.json', 'wx', function(err, fileDescriptor){
        if (!err && fileDescriptor){
            //Convert the data to a string object
            stringData = JSON.stringify(data);

            //Write to file and close it
            fs.writeFile(fileDescriptor, stringData, function(err){
                if (!err) {
                    //closeit
                    fs.close(fileDescriptor, function(err){
                        if (!err) {
                            cb(false)
                        } else {
                            cb(err);
                        };
                    });
                } else {
                    cb('error writing to file');
                };
            });
        }else {
            cb(err);
        };      
    });
};

//Read the file
crud.read = function (dirName, file, cb){

    //Read from the file
    fs.readFile(crud.baseDir+'/'+dirName+'/'+file+'.json', 'utf8', function(err, data){
        console.log('crud.read -> Entering data directory: ', crud.baseDir+'/'+dirName+'/'+file+'.json');
        console.log('crud.read -> Parsing data: ', data);
        console.log('crud.read -> type of data', typeof(data));
        cb(err, data);
    });
};

//Update the file
crud.update = function (dirName, file, data, cb){
    //Open the file for writing to
    fs.open(crud.baseDir+'/'+dirName+'/'+file+'.json', 'r+', function(err, fileDescriptor){
        if (!err && fileDescriptor){
            //Convert the data to a string object
            stringData = JSON.stringify(data);

            //Truncate the file
            fs.truncate(fileDescriptor, function(err){
                if (!err){
                    //Write to file and close it
                    fs.writeFile(fileDescriptor, stringData, function(err){
                        if (!err) {
                            //closeit
                            fs.close(fileDescriptor, function(err){
                                if (!err) {
                                    cb(false)
                                } else {
                                    cb('error closing file');
                                };
                            });
                        } else {
                            cb('error writing to existing file');
                        };
                    });
                } else {
                    cb(err);
                };
            });           
        }else {
            cb(err);
        };      
    });
};


//Delete the file
crud.delete = function (dirName, file, cb){

    //Remove the file
    console.log('crud.delete -> Deleting records at: ', crud.baseDir+'/'+dirName+'/'+file+'.json');
    fs.unlink(crud.baseDir+'/'+dirName+'/'+file+'.json', function(err){
        //console.log('crud.read -> Parsing data: ', data);
        if (!err){
            cb(false);
        } else {
            cb('error deleting file');
        };    
    });
};

module.exports = crud;