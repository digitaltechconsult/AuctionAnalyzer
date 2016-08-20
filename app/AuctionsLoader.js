require("console-stripe")(console);
const Http = require('../lib/HttpHelper');
const MongoDbHelper = require('../lib/MongoDbHelper');
const AppSettings = require('./AppSettings');
const Auctions = require('./Auctions');

function AuctionsLoader() {
}

function getDataFiles(dbInstance, callback) {
    console.info("Preparing to get the list of AH data files");

    var http = new Http();
    http.get(AppSettings.ahUrl(), function (data) {
        var object = JSON.parse(data);
        console.log("Retrieved %d file(s) from Blizzard", object.files.length);
        callback(object.files);
    }, function (error) {
        console.warn("Error occured while connecting to %s, nothing to do here", AppSettings.ahUrl());
        callback(false);
    }, function () {
        //we don't need to know what data chunks contain
    });
}

function readDataFiles(dbInstance, files, callback) {
    getLastTimestamp(dbInstance, function (lastTimestamp) {
        files.forEach(function (file) {
            if (file.lastModified > lastTimestamp) {
                console.info("Found a new file, preparing to retrieve %s", file.url);
                var http = new Http(false); //non SSL
                http.get(file.url, function (data) {
                    var newData = JSON.parse(data);
                    newData.timestamp = file.lastModified;
                    console.log("Loaded data size: %d", data.length);
                    callback(newData);
                }, function (error) {
                    console.warn("Cannot get %s", file.url);
                }, function () {
                    //no need for chunks
                });
            } else {
                console.info("File is older than expected, nothing to do");
                callback(false);
            }
        });
    });
}

function getLastTimestamp(dbInstance, callback) {
    console.info("Reading last timestamp from the database");
    var lastTimestamp = 0;
    var collection = dbInstance.collection('auctions_' + AppSettings.realm);
    collection.distinct('timestamp', function (error, results) {
        if (error !== null) {
            console.error("Cannot retrieve the last timestamp from the database");
        } else {
            //get the last timestamp
            for (i = 0; i < results.length; ++i) {
                lastTimestamp = results[i] > lastTimestamp ? results[i] : lastTimestamp;
            }
            console.log("Last timestamp found is %d", lastTimestamp);
            callback(lastTimestamp);
        }
    });
}

function insertAuctionsData(dbInstance, auctions, callback) {
    var collection = dbInstance.collection('auctions_' + AppSettings.realm);
    collection.insert(auctions, function (error, result) {
        if (error !== null) {
            console.error("Cannot insert auctions.");
        } else {
            console.log("%d row(s) successfully into the database", auctions.length);
            callback();
        }
    });
}

AuctionsLoader.prototype.loadAuctions = function (callback) {
    var $this = this;
    console.info("Process of loading auction data begins");

    var mongoClient = new MongoDbHelper();
    mongoClient.connect(function () {
        getDataFiles(mongoClient, function (files) {
            if(files === false) {
                mongoClient.disconnect(function () {
                        console.warn("Could not retrieve the file list from Blizzard");
                    });
                    callback();
            } else {
            readDataFiles(mongoClient, files, function (data) {
                //if we don't have any data to process, just exit
                if (data === false) {
                    mongoClient.disconnect(function () {
                        console.warn("No new data found, process will disconnect from the database");
                    });
                    callback();
                } else {
                    var auctions = new Auctions();
                    auctions.prepareData(data);
                    insertAuctionsData(mongoClient, auctions.collection, function () {
                        console.info("Auctions imported successfully");
                        mongoClient.disconnect(function () {
                            console.info("Process disconnected from database.");
                        });
                        callback();
                    });
                }
            });
            }
        });
    }, function () { });
}

module.exports = AuctionsLoader;

