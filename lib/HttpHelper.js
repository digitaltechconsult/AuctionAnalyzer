//Author: Bogdan Coticopol
//v.0.1 (beta) - 18.08.2016

require("console-stripe")(console);
const log = require('single-line-log').stdout;
const events = require('events');
const http = require('http');
const https = require('https');

function HttpHelper(ssl = true) {

    //select http(s) based on the SSL flag
    this.httpObject = ssl === true ? https : http;

    //setup event emmiter
    this.eventEmmiter = new events.EventEmitter();

    //event types constants
    this.event = {
        success: 'download_ready',
        fail: 'download_failed',
        progress: 'download_in_progress'
    };
}

HttpHelper.prototype.get = function (url, onSuccess, onFail, onProgress) {
    var $this = this;

    //link events
    this.eventEmmiter.on(this.event.success, onSuccess);
    this.eventEmmiter.on(this.event.fail, onFail);
    this.eventEmmiter.on(this.event.progress, onProgress);
    this.eventEmmiter.on(this.event.error, onFail);

    //check if url is null or not and raise fail event
    if (url === null) {
        $this.eventEmmiter.emit($this.event.fail, Error(-1));
        console.error("Invalid URL provided, aborting");
        return;
    }

    console.log("New request for url %s", url);
    //make GET request
    try {
        $this.httpObject.get(url, function (response) {
            var responseString = '';

            //if we cannot get data, trigger fail event
            if (response.statusCode !== 200) {
                console.error("Server response status error: %s(%s)", response.statusMessage, response.statusCode);
                $this.eventEmmiter.emit($this.event.fail, response.statusCode);
                return;
            }
            var contentLength = -1;
            if (response.headers['content-length'] !== 'undefined' || response.headers['content-length'] !== null) {
                contentLength = response.headers['content-length'];
                console.info("Total transfer size: " + contentLength);
            }

            response.on('data', function (chunk) {
                //append the chunks to final response
                responseString += chunk.toString('utf8');
                var downloadProgress = "Download progress: " + Math.round(100 * responseString.length / contentLength) + "%\n";
                log(downloadProgress);
                //send the caller partial data we received
                $this.eventEmmiter.emit($this.event.progress, chunk);
            }).on('error', function (error) {
                //call fail event
                console.error("Error encountered while getting data: " + error);
                $this.eventEmmiter.emit($this.event.fail, error);
            }).on('end', function () {
                console.info("Data retrieved (%s)", url);
                $this.eventEmmiter.emit($this.event.success, responseString);
            });
        });
    } catch (err) {
        console.warn("Exception catched from Http module");
        onFail(err);
    }
}



module.exports = HttpHelper;