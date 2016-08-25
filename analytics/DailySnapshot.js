require('console-stripe')(console);
let MongoClient = require('../lib/MongoDbHelper');
let AppSettings = require('../app/AppSettings');

function DailySnapshot() {}

DailySnapshot.prototype.generateSnapshot = function(lastXDays = 0) {
    var mongoClient = new MongoClient();
    mongoClient.connect(onConnect, onError);

    function onConnect() {
        console.info("Connected to database");
        var collectionName = 'auctions_' + AppSettings.realm;
    }

    function onError() {
        console.error("Cannot connect to database");
    }

}

module.exports = DailySnapshot;