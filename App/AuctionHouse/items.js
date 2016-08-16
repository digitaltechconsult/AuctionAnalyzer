const http = require('../Helpers/httpHelper.js');
const settings = require('./settings');
const MongoDBHelper = require('../Helpers/mongoDBHelper');
const log = require('single-line-log').stdout;

function ItemLibrary() {
    this.collectionName = 'item_library';
    this.items = [];
    this.ahItems = [];
}

ItemLibrary.prototype.updateLibrary = function() {
    var $this = this;

    var mongodb = new MongoDBHelper();
    mongodb.connect(function(){
        var itemsCollection = mongodb.getCollection($this.collectionName);
        var ahItemsCollection = mongodb.getCollection("auctions_" + settings.realm);

        //retrieve current items
        itemsCollection.distinct('item', function(error, results) {
            if(error !== null) {
                console.error("items.js: updateLibrary() - " + error);
                mongodb.disconnect();
            } else {
               $this.items = results;
               
               //retrieve AH items
               ahItemsCollection.distinct('item', function(error, results) {
                   if(error !== null) {
                       console.error("items.js: updateLibrary() - " + error);
                   } else {
                       $this.ahItems = results;

                       //TODO: execute item data retrieval
                       if ($this.items !== null && $this.ahItems !== null) {
                           var itemsToUpdate = getItemsToUpdate($this.items, $this.ahItems);
                           
                       }
                   }
                   mongodb.disconnect();
               });
            }
        });
    },

    function() { //error 
    });
}

function getItemsToUpdate(items, ahItems) {
    var $this = this;
    
    var itemsToUpdate = ahItems.diff(items);
    return itemsToUpdate !== null ? getItemsToUpdate : [];
}

module.exports = ItemLibrary;

var il = new ItemLibrary();
il.updateLibrary();



