require('console-stripe')(console);
const MongoClient = require('../lib/MongoDbHelper');
const AppSettings = require('../app/AppSettings');

function DailyAnalytics() {
    this.Faction = {
        Alliance:0,
        Horde:1
    };

    this.Collection = 'auctions_' + AppSettings.realm;
}

DailyAnalytics.prototype.getPlayersByFaction = function(faction, onSuccess, onError) {
    var self = this;
    var factionString = faction == self.Faction.Alliance ? 'Alliance' : 'Horde';
    console.info("Retrieving players by faction, " + factionString);

    var mongoClient = new MongoClient();
    mongoClient.connect(onDatabaseConnect, onDatabaseError);

    function onDatabaseConnect() {
        mongoClient.collection('character_library').find({faction:faction}).toArray(function(error, results){
            
            mongoClient.disconnect(function(){
                console.info("Disconnected from the database");
            });
            
            if(error !== null) {
                console.error("Error querying database: " + error);
                onError(error);
            } else {
                console.log("Found %d %s players.", results.length, factionString);
                onSuccess(results);
            }
        });
    }

    function onDatabaseError(err) {
        console.error("MongoDB error: " + err);
    }
}

module.exports = DailyAnalytics;


var x = new DailyAnalytics();
x.getPlayersByFaction(x.Faction.Horde,function(results){
    console.log("Retrieved " + JSON.stringify(results));
}, function(){});
