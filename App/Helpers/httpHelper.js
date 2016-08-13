const http = require('http');
const https = require('https');
const log = require('single-line-log').stdout;

function get(url, onsuccess, onerror, secure = true) {
    //if secure parameter is true, then use https
    if (url === null || url === 'undefined') return false;
    var httpHandler = secure ? https : http;

    httpHandler.get(url, function (response) {
        //tha accumulator string used to save the response
        var responseString = '';
        var contentLength = -1;

        console.log("httpHelper.js: Status code: " + response.statusCode + " for url: " + url);
        if (response.headers['content-length'] !== 'undefined' || response.headers['content-length'] !== null) {
            contentLength = response.headers['content-length'];
            console.log("httpHelper.js: Total transfer size: " + contentLength);
        }

        response.on('data', function (chunk) {
            responseString += chunk.toString('utf8'); //append the chunks of the response
            //console.log("Transffered " + responseString.length + " of " + contentLength);
            var downloadProgress = "httpHelper.js: Download progress: " + Math.round(100 * responseString.length/contentLength) + "%\n";
            log(downloadProgress);
        }).on('error', function (error) {
            console.error("httpHelper.js: Error occured: " + error)
            onerror(error); //pass the error to caller function
        }).on('end', function () {
            onsuccess(responseString); //operation ended, return the final result
            console.log("httpHelper.js: Download complete.");
        });
    });
}

module.exports.get = get;
