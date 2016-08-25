require( "console-stripe" )( console );
const mongoClient = require('mongodb').MongoClient;
const appSettings = require('../App/AppSettings');

function MongoDbHelper() {
    //server path
    this.server = 'mongodb://127.0.0.1:27017/AuctionHouse?socketTimeoutMS=90000';

    //database object used to query the database
    this.db = null;
}

MongoDbHelper.prototype.connect = function(onConnect, onError) {
    var $this = this;

    //connect to database
    mongoClient.connect($this.server, function(error, database){
        //check if we have an error and call the error delegate
        if(error !== null || database === null) {
            console.error("Error connecting to database server %s", $this.server);
            onError();
        } else {
            console.log("Connected to database server %s", $this.server);
            $this.db = database;
            onConnect(database);
        }
    });
}

MongoDbHelper.prototype.disconnect = function(onDisconnect) {
    var $this = this;

    //disconnect from database server
    if($this.db !== null) {
        $this.db.close();
        $this.db = null;
        console.info("Disconnected from the database");
        onDisconnect();
    }
}

MongoDbHelper.prototype.collection = function(collectionName) {
    return this.db.collection(collectionName);
}

module.exports = MongoDbHelper;