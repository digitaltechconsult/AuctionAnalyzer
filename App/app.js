const AuctionHouseWebLoader = require('./AuctionHouse/auctionHouseWebLoader');

var ahwl = new AuctionHouseWebLoader();
ahwl.getAuctionHouseFile(function() {
    ahwl.readAuctionHouseFiles(function(ahData) {
        console.log("ahData ready");
    });
});