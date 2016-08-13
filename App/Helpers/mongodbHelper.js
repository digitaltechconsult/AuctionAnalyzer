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
            console.error("There is an error connecting to MongoDB: " + error)
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

MongoDBHelper.prototype.insert = function(ahData) {
    var $this = this;

    var collection = this.dbCon.collection($this.catalogName);
    collection.insert(ahData, function(error,result){
        if (error !== null) {
            console.error("Error inserting data: " + error);
        } else {
            console.log("Added data file with " + ahData.files.length + " records.");
        }
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