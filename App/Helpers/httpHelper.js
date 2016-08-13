const http = require('http');
const https = require('https');

function get(url, onsuccess, onerror, secure = true) {
    //if secure parameter is true, then use https
    if (url === null || url === 'undefined') return false;
    var httpHandler = secure ? https : http;

    httpHandler.get(url, function (response) {
        //tha accumulator string used to save the response
        var responseString = '';
        var contentLength = -1;

        console.log("Status code: " + response.statusCode);
        if (response.headers['content-length'] !== 'undefined' || response.headers['content-length'] !== null) {
            contentLength = response.headers['content-length'];
            console.log("Total transfer size: " + contentLength);
        }

        response.on('data', function (chunk) {
            responseString += chunk.toString('utf8'); //append the chunks of the response
            //console.log("Transffered " + responseString.length + " of " + contentLength);
        }).on('error', function (error) {
            console.error("Error occured: " + error)
            onerror(error); //pass the error to caller function
        }).on('end', function () {
            onsuccess(responseString); //operation ended, return the final result
            console.log("Request complete");
        });
    });
}

module.exports.get = get;
