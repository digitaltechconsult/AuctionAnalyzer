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
                console.error("Error occured while querying the database, no data have been retrieved. The execution will stop." + error);
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

CharactersLoader.prototype.loadCharacters = function (onSuccess, onError) {
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

CharactersLoader.prototype.notIn = function(collection, inCollection) {
    var results = [];
    for(var i=0; i<collection.length; i++) {
        var found = false;

        for(var j=0; j<inCollection.length; j++) {
            found = (collection[i]._id.realm == inCollection[j]._id.realm && collection[i]._id.character == inCollection[j]._id.character);
            if(found == true) {
                break;
            }
        }

        if(!found) {
                results.push(collection[i]);
        }
        
        //check if we already have all results so we don't iterate anymore
        if(results.length == inCollection.length) {
            for(k=i+1; k<collection.length; k++) {
                results.push(collection[k]);
            }
            break;
        }

    }
    return results;
}

CharactersLoader.prototype.generateUpdateList = function (onSuccess, onError) {
    var $this = this;

    function ifExists(element, collection) {
        var result = false;
        collection.forEach(function (value) {
            result = element["_id"]["character"] == value["_id"]["character"] && element["_id"]["realm"] == value["_id"]["realm"];
        });
        return result;
    }

    $this.loadCharacters(function (characters) {
        $this.loadAhCharacters(function (ahCharacters) {

            remainingCharacters = $this.notIn(ahCharacters, characters);
            
            if (remainingCharacters.length > 0) {
                console.log("Need to process %d characters", remainingCharacters.length);
                onSuccess(remainingCharacters);
            } else {
                console.warn("No characters to process, nothing to do");
                onError();
            }
        }, function () {
            console.error("Error getting characters from collection %s", $this.ahCollectionName);
        });
    }, function () {
        console.error("Error getting characters from collection %s", $this.charactersCollectionName);
    });
}

CharactersLoader.prototype.normalizeRealmName = function(realm, separator = "-") {
    var string = realm.split(/(?=[A-Z])/);
    if(string.length > 1) {
        console.log("Realm name normalized. Old name: %s; New name: %s",realm,string.join(separator));
        return string.join('-');
    }
    return realm;
}

CharactersLoader.prototype.updateCharacter = function (object, collection, onSuccess, onError) {
    var $this = this;

    console.log("Updating information for character %s [%s]", object.character, object.realm);
    var http = new Http(true);
    var url = AppSettings.playerUrl($this.normalizeRealmName(object.realm).toString('utf8'), object.character.toString('utf8'));
    http.get(url, httpSuccess, httpFail, function () { });

    function httpFail(err) {
        console.warn("HTTP Error encountered for: " + JSON.stringify(object));
        //check blizzard errors
        if (err === 404) {
            var newObject = {
                name: "Character#" + object.character
            };
            console.warn("Cannot retrive information about character, saving it as '<not found>'");
            $this.insertCharacterInDatabase(newObject, collection, onSuccess, onError);
        } else {
            console.warn("Cannot retrieve item information from url %s", AppSettings.playerUrl(object.character, $this.normalizeRealmName(object.realm)));
            onError();
        }
    }

    function httpSuccess(data) {
        var object = JSON.parse(data);
        console.info("Retrieved character " + object.name + "[" + object.realm + "]");
        object.realm = object.realm.replace(' ',''); //remove white space from realm name to fit auctions
        $this.insertCharacterInDatabase(object, collection, onSuccess, onError);
    }
}

CharactersLoader.prototype.insertCharacterInDatabase = function (object, collectionName, insertSuccess, insertFail) {
    var $this = this;

    var mongoClient = new MongoClient();
    mongoClient.connect(function () {
        var collection = mongoClient.collection(collectionName);
        collection.insert(object, function (error, results) {
            if (error !== null) {
                console.warn("Cannot insert character into database");
                insertFail();
                return;
            } else {
                console.log("Character %s successfully inserted in database", object.name);
                mongoClient.disconnect(function () {
                    insertSuccess();
                });
            }
        }, function () {
            console.warn("Cannot insert item in the database, is the database running?");
            insertFail();
            return;
        });
    });
}

CharactersLoader.prototype.updateCharactersList = function () {
    var $this = this;

    $this.generateUpdateList(function (characters) {
        characters.forEach(function (character, index) {
            setTimeout(function () {
                $this.updateCharacter(character._id, $this.charactersCollectionName, function () { }, function () { });
            }, 750 * index);
        });
    }, function () {
        console.warn("Character list was not updated");
    });
}

module.exports = CharactersLoader;
