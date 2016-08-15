const http = require('../Helpers/httpHelper.js');
const settings = require('./settings');
const MongoDBHelper = require('../Helpers/mongoDBHelper');
const log = require('single-line-log').stdout;

function ItemLibrary() {
    this.collectionName = 'item_library';
}

ItemLibrary.prototype.updateLibrary = function() {
    var $this = this;

    var mongodb = new MongoDBHelper();
    mongodb.connect(function(){
        var itemCollection = mongodb.getCollection($this.collectionName);
        itemCollection.find().count(function(error, result){
            console.log(result);
            mongodb.disconnect();
        });
        mongodb.disconnect();
    },
    function() { //error 
    });

}

module.exports = ItemLibrary;

var il = new ItemLibrary();
il.updateLibrary();



