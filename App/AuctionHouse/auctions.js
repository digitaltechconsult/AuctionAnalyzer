var log = require('single-line-log').stdout;

function Auction() {
    this.timestamp = null;
    this.id = null;
    this.item = null;
    this.owner = null;
    this.ownerRealm = null;
    this.realms = null;
    this.bid = null;
    this.buyout = null;
    this.quantity = null;
    this.timeleft = null;
    this.rand = null;
    this.seed = null;
    this.context = null;
}

function Auctions() {
    this.collection = [];
    console.log("auctions.js: New Auctions object created");
}

Auctions.prototype.readBlizzardData = function (data) {
    var $this = this;
    console.log("auctions.js: Reading Blizzard data");

    var realms = data.data.realms;
    var auctions = data.data.auctions;

    for(i=0;i<auctions.length;i++) {
        var readProgress = "auctions.js: Reading progress: " + Math.round(100 * i/auctions.length) + "%\n";
        log(readProgress);
        var row = auctions[i];
        
        var auction = new Auction();
        auction.timestamp = data.data.timestamp;
        auction.id = row.auc;
        auction.item = row.item;
        auction.owner = row.owner;
        auction.realms = realms;
        auction.ownerRealm = row.ownerRealm;
        auction.bid = row.bid;
        auction.buyout = row.buyout;
        auction.quantity = row.quantity;
        auction.timeleft = row.timeLeft;
        auction.rand = row.rand;
        auction.seed = row.seed;
        auction.context = row.context;

        $this.collection.push(auction);
    }
}

module.exports = Auctions;