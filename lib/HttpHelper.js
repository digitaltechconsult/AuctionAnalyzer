//Author: Bogdan Coticopol
//v.0.1 (beta) - 18.08.2016

require( "console-stripe" )( console );
const events = require('events');
const http = require('http');
const https = require('https');

function HttpHelper(ssl = true, onSuccess, onFail, onProgress) {

    //select http(s) based on the SSL flag
    this.httpObject = ssl === true ? https : http;

    //setup event emmiter
    this.eventEmmiter = new events.EventEmitter();

    //event types constants
    this.event = {
        success:'download_ready',
        fail:'download_failed',
        progress:'download_in_progress'
    };

    //link events
    this.eventEmmiter.on(this.event.success, onSuccess);
    this.eventEmmiter.on(this.event.fail, onFail);
    this.eventEmmiter.on(this.event.progress, onProgress);
    this.eventEmmiter.on(this.event.error, onFail);
}

HttpHelper.prototype.get = function(url) {
    var $this = this;

    //check if url is null or not and raise fail event
    if(url === null) {
        $this.eventEmmiter.emit($this.event.fail, Error(-1));
        console.error("Invalid URL provided, aborting");
        return;
    }

    console.log("New request for url %s", url);
    //make GET request
    $this.httpObject.get(url, function(response){
        var responseString = '';
       
        //if we cannot get data, trigger fail event
        if(response.statusCode !== 200) {
            console.error("Server response status error: %s(%d)", response.statusMessage, response.statusCode);
            $this.eventEmmiter.emit($this.event.fail, response.status);
        }

        response.on('data', function(chunk) {
            //append the chunks to final response
            responseString += chunk.toString('utf8');
            
            //send the caller partial data we received
            $this.eventEmmiter.emit($this.event.progress, chunk);
        }).on('error', function(error) {
            //call fail event
            console.error("Error encountered while getting data: " + error);
            $this.eventEmmiter.emit($this.event.fail, error);
        }).on('end', function() {
            console.info("Data retrieved (%s)", url);
            $this.eventEmmiter.emit($this.event.success, JSON.parse(responseString));
        });
    });
}



module.exports = HttpHelper;

var aux = new HttpHelper(false, function(){
    //console.log("received data");
}, function(){
    //console.error("error");
}, function() {
    //console.info("some chunks");
});
aux.get('http://ip.jsontest.com');