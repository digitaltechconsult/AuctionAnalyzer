const mongoose = require('mongoose');

function MongoDBHelper() {
    this.serverURL = 'mongodb://localhost:27017/AuctionHouse';
    this.dbCon = null;
}

MongoDBHelper.prototype.connect = function(ready) {
    var main = this;

    mongoose.connect(this.serverURL, function(error, db) {
        if (error !== 'undefined' && db !== 'undefined') {
            main.dbCon = db;
            if (main.dbCon !== null) {
                ready();
            }
        } else {
            console.error("Error occured: " + error);
        }
    });
}

MongoDBHelper.prototype.disconnect = function() {
    if (this.dbCon !== null) {
        this.dbCon.close();
        this.dbCon = null;
    }
}

MongoDBHelper.prototype.insert = function(ahData) {
    var collection = this.dbCon.collection('documents');
    collection.insert(ahData, function(error,result){
        if (error !== null) {
            console.error("Error inserting data: " + error);
        } else {
            console.log("Added data file with " + ahData.file.length + " records.");
        }
    });
}


module.exports = MongoDBHelper;