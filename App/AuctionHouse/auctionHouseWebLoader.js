const settings = require('./settings');
const http = require('../Helpers/httpHelper');
const mongodbHelper = require('../Helpers/mongodbHelper');

//class constructor
function AuctionHouseWebLoader() {
    this.ahData = new Object();
    console.log("auctionHouseWebLoader.js: New AuctionHouseWebLoader object created.");
}

//class method - get ah json file data
AuctionHouseWebLoader.prototype.getAuctionHouseFile = function (onsuccess, onerror) {
    var $this = this;

    function success(data) {
        var object = JSON.parse(data);

        $this.ahData.files = object.files
        console.log("auctionHouseWebLoader.js: Data files retrieved.");
        onsuccess();
    }

    function error(e) { 
        console.error("auctionHouseWebLoader.js: getAuctionHouseFile() error - " + e);
        onerror(e);
    }

    http.get(settings.apiURL, success, error, true);
}

AuctionHouseWebLoader.prototype.readAuctionHouseFiles = function (onsuccess, onerror) {
    var $this = this;

    $this.ahData.files.forEach(function (file) {
        console.log("auctionHouseWebLoader.js: Preparing to download " + file.url);

        function success(data) {
            $this.ahData.data = JSON.parse(data);
            $this.ahData.data.timestamp = file.lastModified;
            console.log("auctionHouseWebLoader.js: %s loaded in memory.", file.url);
            onsuccess();
        }

        function error(e) { 
            console.error("auctionHouseWebLoader.js: readAuctionHouseFiles() error - " + e);
            onerror(e);
        }

        var mongodb = new mongodbHelper();
        var lastTimestamp = 0;
        mongodb.connect(function () {
            //get last inserted timestamp
            mongodb.getLastTimestamp(function (timestamp) {
                lastTimestamp = timestamp;
                mongodb.disconnect();
                //if file timestamp is greater than db timestamp
                if (file.lastModified > lastTimestamp && lastTimestamp !== null) {
                    console.log("auctionHouseWebLoader.js: File timestamp is newer than database, getting Blizzard data");
                    http.get(file.url, success, error, false);
                } else if(lastTimestamp === null) {
                    console.log("auctionHouseWebLoader.js: No data found in the database, getting Blizzard data");
                    http.get(file.url, success, error, false);
                } else {
                    console.log("auctionHouseWebLoader.js: No new data found, aborting.");
                    onerror();
                }
            });
        });
    });
}

//export as class 
module.exports = AuctionHouseWebLoader;