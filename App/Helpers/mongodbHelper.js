const mongoClient = require('mongodb').MongoClient;
const appSettings = require('../AuctionHouse/settings');

function MongoDBHelper() {
    this.catalogName = 'auctions_' + appSettings.realm;
    this.serverURL = 'mongodb://localhost:27017/AuctionHouse';
    this.dbCon = null;
    console.log("mongodbHelper.js: New MongoDBHelper object created.");
}

MongoDBHelper.prototype.connect = function (ready, callbackError) {
    var $this = this;

    mongoClient.connect($this.serverURL, function (error, database) {
        if (error === null && database !== null) {
            $this.dbCon = database;
            console.log("mongodbHelper.js: Connected to database.");
            ready();
        } else {
            console.error("mongodbHelper.js: connect() - " + error);
            callbackError();
        }
    });
}

MongoDBHelper.prototype.disconnect = function () {
    var $this = this;

    if ($this.dbCon !== null) {
        $this.dbCon.close();
        $this.dbCon = null;
        console.log("mongodbHelper.js: Disconnected from database.");
    }
}

MongoDBHelper.prototype.insert = function (data, callback) {
    var $this = this;

    var collection = this.dbCon.collection($this.catalogName);
    collection.insert(data, function (error, result) {
        if (error !== null) {
            console.error("mongodbHelper.js: insert() -  " + error);
        } else {
            console.log("mongodbHelper.js: Added data file with " + data.length + " records.");
            callback();
        }
    });
}

MongoDBHelper.prototype.getLastTimestamp = function (callback) {
    var $this = this;

    var lastTimestamp = 0;
    var collection = $this.dbCon.collection($this.catalogName);
    var cursor = collection.distinct('timestamp', function (err, results) {
        if (err !== null) {
            console.error("mongodbHelper.js: getLastTimestamp() - " + err);
        } else {
            results.forEach(function (result) {
                lastTimestamp = result > lastTimestamp ? result : lastTimestamp;
            });
        }
        console.log("mongodbHelper.js: Last timestamp found in the database is: " + lastTimestamp);
        callback(lastTimestamp);
    });
}


module.exports = MongoDBHelper;