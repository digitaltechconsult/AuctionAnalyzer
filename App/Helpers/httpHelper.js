const http = require('http');
const https = require('https');
const log = require('single-line-log').stdout;
const sleep = require('sleep');

function get(url, onsuccess, onerror, secure = true) {
    
    //if secure parameter is true, then use https
    if (url === null || url === 'undefined') return false;
    var httpHandler = secure ? https : http;
    //console.log("httpHelper.js: SSL = " + secure);

    httpHandler.get(url, function (response) {
        //the accumulator string used to save the response
        var responseString = '';
        var contentLength = -1;

        //console.log("httpHelper.js: Status code: " + response.statusCode + " for url: " + url);
        //if status is not success raise error and exit
        if(response.statusCode != 200) {
            onerror(response.statusCode + " " + response.statusMessage);
            return;
        }
        
        if (response.headers['content-length'] !== 'undefined' || response.headers['content-length'] !== null) {
            contentLength = response.headers['content-length'];
            console.log("httpHelper.js: Total transfer size: " + contentLength);
        }

        response.on('data', function (chunk) {
            responseString += chunk.toString('utf8'); //append the chunks of the response
            var downloadProgress = "httpHelper.js: Download progress: " + Math.round(100 * responseString.length/contentLength) + "%\n";
            log(downloadProgress);
        }).on('error', function (e) {
            console.error("httpHelper.js: get() error - : " + e)
            onerror(error); //pass the error to caller function
        }).on('end', function () {
            onsuccess(responseString); //operation ended, return the final result
            console.log("httpHelper.js: Download complete (%s).", url);
        });
    });
}

module.exports.get = get;
