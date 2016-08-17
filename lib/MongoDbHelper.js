require( "console-stripe" )( console );
const events = require('events');
const mongoClient = require('mongodb').MongoClient;
const appSettings = require('../AuctionHouse/settings');

function MongoDbHelper(delegate) {
    //server path
    this.server = 'mongodb://localhost:27017/AuctionHouse';

    //database object used to query the database
    this.db = null;

    //generic event handler
    this.eventEmitter = new events.EventEmitter();

    //list of possible events
    this.event = {
        connect: 'connect',
        error: 'error',
        disconnect: 'disconnect',
        insert:'insert'
    };

    //delegate object used by calling code to catch the events
    this.delegate = delegate;

    //register events
    this.eventEmitter.on(this.event.connected, this.delegate.onConnect);
    this.eventEmitter.on(this.event.error, this.delegate.onError);
    this.eventEmitter.on(this.event.insert, this.delegate.onInsert);
}

MongoDbHelper.prototype.connect = function() {
    var $this = this;

    //connect to database
    mongoClient.connect($this.server, function(error, database){
        //check if we have an error and call the error delegate
        if(error !== null || database === null) {
            console.error("Error connecting to database server %s", $this.server);
            $this.eventEmitter.emit($this.event.error);
        } else {
            console.log("Connected to database server %s", $this.server);
            $this.db = database;
            $this.eventEmitter.emit($this.event.connect);
        }
    });
}

MongoDbHelper.prototype.disconnect = function() {
    var $this = this;

    //disconnect from database server
    if($this.db !== null) {
        $this.db.disconnect();
        $this.db = null;
        console.info("Disconnected from the database");
        $this.eventEmitter.emit($this.event.disconnect);
    }
}

MongoDbHelper.prototype.getCollection = function(collectionName) {
    return this.db.collection(collectionName);
}

MongoDbHelper.prototype.insert = function(collectionName, data) {
    var $this = this;

    var collection = this.getCollection(collectionName);
    mongoClient.insert(data, function(error) {
        if(error !== null) {
            console.error("Error inserting data into collection");
            $this.eventEmitter.emit($this.event.error);
        } else {
            $this.eventEmitter.emit($this.event.insert);
        }
    });
}

module.exports = MongoDbHelper;