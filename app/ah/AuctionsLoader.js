require( "console-stripe" )( console );
const Http = require('../../lib/HttpHelper');
const MongoDbHelper = require('../../lib/MongoDbHelper');
const AppSettings = require('../AppSettings');
const Auctions = require('./Auctions');

function AuctionsLoader() {
    this.data = {};
    this.files = [];
}

function getDataFile(callback) {
    var $this = this;
    console.info("Preparing to get the list of AH data files");
    
    var http = new Http();
    http.get(AppSettings.ahUrl, function(data){
        var object = JSON.parse(data);
        $this.files = object.files;
        console.log("Retrieved %d data files from Blizzard", $this.files.length);
        callback();
    }, function(error) {
        console.warn("Error occured while connecting to %s, nothing to do here", AppSettings.ahUrl);
    }, function() {
        //we don't need to know what data chunks contain
    });
}

function readDataFiles(callback) {
    var $this = this;
    
    var dbDelegate = {
        onConnect: function(dbInstance) {
            //connected to database, start pulling the data
            console.info("Preparing to get AH data from Blizzard");
            getLastTimestamp(dbInstance, function(lastTimestamp) {

                $this.files.forEach(function(file) {
                    if(file.lastModified > lastTimestamp) {
                        console.info("Found a new file, preparing to retrieve %s", file.url);
                        var http = new Http(false); //non SSL
                        http.get(file.url, function(data){
                            $this.data = JSON.parse(data);
                            $this.data.timestamp = file.lastModified;
                            console.log("Loaded %d of data", $this.data.length);
                            callback();
                        }, function(error) {
                            console.warn("Cannot get %s", file.url);
                        }, function(){
                            //no need for chunks
                        });
                    } else {
                        console.info("File is older than expected, nothing to do");
                    }
                });
            });
        }, 
        onError: function() {
            console.warn("Error occured while connecting to database in module 'AuctionsLoader.js'");
        },
        onDisconnect: function() {
            //nothing to handle, yet
            console.info("Disconnected from the database in module 'AuctionsLoader.js'");
        }
    };
    var mongoClient = new MongoDbHelper(dbDelegate);
}

function getLastTimestamp(dbInstance, callback) {
    var lastTimestamp = 0;
    var collection = dbInstance.getCollection('auctions_' + AppSettings.realm);
    collection.distinct('timestamp', function(error, results) {
        if(error !== null) {
            console.error("Cannot retrieve the last timestamp from the database");
        } else {
            //get the last timestamp
            for(i=0; i<results.length; ++i) {
                lastTimestamp = results[i] > lastTimestamp ? results[i] : lastTimestamp;
            }
            console.log("Last timestamp found is %d", lastTimestamp);
            callback(lastTimestamp);
        }
    });
}

function insertAuctionsData(auctions) {

}

module.exports = AuctionsLoader;

