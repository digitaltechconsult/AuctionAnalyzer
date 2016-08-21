require('console-stripe')(console);
const _ = require('underscore');
const AppSettings = require('./AppSettings');
const MongoClient = require('../lib/MongoDbHelper');
const Http = require('../lib/HttpHelper');

function CharactersLoader() {
    this.charactersCollectionName = 'character_library';
    this.ahCollectionName = 'auctions_' + AppSettings.realm;
}

CharactersLoader.prototype.loadAhCharacters = function (onSuccess, onError) {
    var $this = this;

    var mongoClient = new MongoClient();
    mongoClient.connect(function () {
        var collectionName = $this.ahCollectionName;
        console.info("Preparing to retrieve list of known characters from table %s", collectionName);
        var collection = mongoClient.collection(collectionName);

        console.info("Quering collection by using realm and character name (ownerRealm & owner fields)");
        collection.aggregate([{
            "$group": {
                "_id": {
                    realm: "$ownerRealm",
                    character: "$owner"
                }
            }
        }], function (error, results) { //results of the query
            if (error !== null) {
                console.error("Error occured while querying the database, no data have been retrieved. The execution will stop.");
                onError();
            } else {
                console.log("Found %d characters in collection %s", results.length, collectionName);
                mongoClient.disconnect(function () { });
                onSuccess(results);
            }
        });
    }, function () { //database
        console.error("CharacterLoader cannot connect to database");
        onError();
    });
}

CharactersLoader.prototype.loadCharacters = function(onSuccess, onError) {
    var $this = this;

    var mongoClient = new MongoClient();
    mongoClient.connect(function () {
        var collectionName = $this.charactersCollectionName;
        console.info("Preparing to retrieve list of known characters from table %s", collectionName);
        var collection = mongoClient.collection(collectionName);

        console.info("Quering collection by using realm and character name");
        collection.aggregate([{
            "$group": {
                "_id": {
                    realm: "$realm",
                    character: "$name"
                }
            }
        }], function (error, results) { //results of the query
            if (error !== null) {
                console.error("Error occured while querying the database, no data have been retrieved. The execution will stop.");
                onError();
            } else {
                console.log("Found %d characters in collection %s", results.length, collectionName);
                mongoClient.disconnect(function () { });
                onSuccess(results);
            }
        });
    }, function () { //database
        console.error("CharacterLoader cannot connect to database");
        onError();
    });    
}

CharactersLoader.prototype.generateUpdateList = function(onSuccess, onError) {
    var $this = this;

    $this.loadCharacters(function(characters){
        $this.loadAhCharacters(function(ahCharacters){
            remainingCharacters = _(ahCharacters).difference(characters);
            if(remainingCharacters.length > 0) {
                console.log("Need to process %d characters", remainingCharacters.length);
                onSuccess(remainingCharacters);
            } else {
                console.warn("No characters to process, nothing to do");
                onError();
            }
        }, function(){
            console.error("Error getting characters from collection %s", $this.ahCollectionName);
        });
    }, function(){
        console.error("Error getting characters from collection %s", $this.charactersCollectionName);
    });
}

module.exports = CharactersLoader;

var aux = new CharactersLoader();
aux.generateUpdateList(function(results){
    //console.log(results)
}, function(){
    console.log("Error");
});