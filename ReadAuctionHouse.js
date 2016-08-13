const http = require('./httpHelper');
const settings = require('./settings');

ahData = new Object();

function getAuctionHouseFile(onsuccess) {

    function success(data) {
        var object = JSON.parse(data);
        ahData.files = object.files
        onsuccess();
    }

    function error() {}

    http.get(settings.apiURL, success, error, true);
}

function readAuctionHouseFiles() {
    ahData.files.forEach(function (file) {

        function success(data) {
            ahData.data = JSON.parse(data);
            console.log(ahData);
        }

        function error() {}

        http.get(file.url, success, error, false);
    });
}

getAuctionHouseFile( function() {
    readAuctionHouseFiles();
})


module.exports.getAuctionHouseFile = getAuctionHouseFile;
module.exports.readAuctionHouseFiles = readAuctionHouseFiles;