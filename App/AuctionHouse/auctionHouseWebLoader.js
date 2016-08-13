const settings = require('./settings');
const http = require('../Helpers/httpHelper');

//class constructor
function AuctionHouseWebLoader() {
    this.ahData = new Object();
}

//class method - get ah json file data
AuctionHouseWebLoader.prototype.getAuctionHouseFile = function (onsuccess) {
    var $this = this;
    
    function success(data) {
        var object = JSON.parse(data);
        $this.ahData.files = object.files
        onsuccess();
    }

    function error() { }

    http.get(settings.apiURL, success, error, true);
}

//read ah data files
//TODO: put them in a database
AuctionHouseWebLoader.prototype.readAuctionHouseFiles = function (onsuccess) {
    var $this = this;

    $this.ahData.files.forEach(function (file) {

        function success(data) {
            $this.ahData.data = JSON.parse(data);
            onsuccess();
        }

        function error() { }

        http.get(file.url, success, error, false);
    });
}

//export as class 
module.exports = AuctionHouseWebLoader;