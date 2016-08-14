const mongoClient = require('mongodb').MongoClient;

function MongoDBHelper() {
    this.catalogName = 'auctions';
    this.serverURL = 'mongodb://localhost:27017/AuctionHouse';
    this.dbCon = null;
}

MongoDBHelper.prototype.connect = function(ready) {
    var $this = this;
    
    mongoClient.connect($this.serverURL, function(error, database) {
        if(error === null && database !== null ) {
            $this.dbCon = database;
            ready();
        } else {
            console.error("mongodbHelper.js: There is an error connecting to MongoDB: " + error)
        }
    });
}

MongoDBHelper.prototype.disconnect = function() {
    var $this = this;

    if ($this.dbCon !== null) {
        $this.dbCon.close();
        $this.dbCon = null;
    }
}

MongoDBHelper.prototype.insert = function(data, callback) {
    var $this = this;

    var collection = this.dbCon.collection($this.catalogName);
    collection.insert(data, function(error, result){
        if (error !== null) {
            console.error("mongodbHelper.js: Error inserting data: " + error);
        } else {
            console.log("mongodbHelper.js: Added data file with " + data.length + " records.");
            callback();
        }
    });
}

MongoDBHelper.prototype.getLastTimestamp = function(callback) {
    var $this = this;

    var lastTimestamp = 0;
    var collection = $this.dbCon.collection($this.catalogName);
    var cursor = collection.distinct('timestamp', function(err, results){
        if(err !== null) {
            console.error("mongodbHelper.js: Error occured while getting the timestamp: " + err);
        } else {
        results.forEach(function(result){
            lastTimestamp = result > lastTimestamp ? result : lastTimestamp;   
        });
        }
        console.log("mongodbHelper.js: Last timestamp found in the database is: " + lastTimestamp);
        callback(lastTimestamp);
    });
}

MongoDBHelper.prototype.select = function(endQuery) {
    var $this = this;

    var collection = this.dbCon.collection($this.catalogName);
    var cursor = collection.find();
    cursor.each(function(err,row){
        if (row !== null) {
            console.dir(row);
        } else {
            endQuery();
        }
    });
}


module.exports = MongoDBHelper;