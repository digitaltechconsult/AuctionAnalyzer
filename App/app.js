const MongoDBHelper = require('./Helpers/mongoDBHelper');
const AuctionHouseWebLoader = require('./AuctionHouse/AuctionHouseWebLoader');
const Auctions = require('./AuctionHouse/auctions.js');
var log = require('single-line-log').stdout;

var mongodb = new MongoDBHelper();
var ahwl = new AuctionHouseWebLoader();

mongodb.connect(function() {
    
    //insert
    ahwl.getAuctionHouseFile(function(){
        ahwl.readAuctionHouseFiles(function() {
            var auctions = new Auctions();
            auctions.readBlizzardData(ahwl.ahData);
            mongodb.insert(auctions.collection, function() {
                mongodb.disconnect();
            });
        });
    });
    
    //select
    // mongodb.select(function(){
    //     mongodb.disconnect();
    // });
    
});


