const MongoDBHelper = require('./Helpers/mongoDBHelper');
const AuctionHouseWebLoader = require('./AuctionHouse/AuctionHouseWebLoader');

var mongodb = new MongoDBHelper();
var ahwl = new AuctionHouseWebLoader();



mongodb.connect(function() {
    /*
    //insert
    ahwl.getAuctionHouseFile(function(){
        ahwl.readAuctionHouseFiles(function() {
            mongodb.insert(ahwl.ahData);
            mongodb.disconnect();
        });
    });
    */
    //select
    mongodb.select(function(){
        mongodb.disconnect();
    });
});


