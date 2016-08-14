const settings = require('./settings');
const http = require('../Helpers/httpHelper');
const mongodbHelper = require('../Helpers/mongodbHelper');

//class constructor
function AuctionHouseWebLoader() {
    this.ahData = new Object();
}

//class method - get ah json file data
AuctionHouseWebLoader.prototype.getAuctionHouseFile = function (onsuccess) {
    var $this = this;

    function success(data) {
        //console.log("auctionHouseLoader.js: ");
        var object = JSON.parse(data);

        $this.ahData.files = object.files
        onsuccess();
    }

    function error() { }

    http.get(settings.apiURL, success, error, true);
}

AuctionHouseWebLoader.prototype.readAuctionHouseFiles = function (callback) {
    var $this = this;

    $this.ahData.files.forEach(function (file) {

        function success(data) {
            $this.ahData.data = JSON.parse(data);
            $this.ahData.data.timestamp = file.lastModified;
            callback();
        }

        function error() { }

        var mongodb = new mongodbHelper();
        var lastTimestamp = 0;
        mongodb.connect(function () {
            //get last inserted timestamp
            mongodb.getLastTimestamp(function (timestamp) {
                lastTimestamp = timestamp;
                mongodb.disconnect();
                //if file timestamp is greater than db timestamp
                if (file.lastModified > lastTimestamp || lastTimestamp !== null) {
                    console.log("auctionHouseWebLoader.js: file timestamp is newer than database");
                    http.get(file.url, success, error, false);
                }
            });
        });
    });
}

//export as class 
module.exports = AuctionHouseWebLoader;