var http = require("http");
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var EventEmitter = require("events").EventEmitter
var util = require("util");
var global_events = new EventEmitter();
var url = require("url");
var fs = require('fs');
var playlist = require('./playlist');
var current;


function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    var query = url.parse(request.url).query;
    if (query){
    sendURL(pathname,query);
    }
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("Peticion Recibida");
    response.end();
}


function sendURL(action,link){

	console.log("Item "+ link + " recibido");
	if (action=="/"){
	
		global_events.emit("play",link);

	}else
	if (action=="/p"){

        global_events.emit("queue",link);
		
	}else
	if (action=="/cmd"){
		global_events.emit("omx_cmd",link)
	} 
}
	





http.createServer(onRequest).listen(8888);

console.log("Servidor Iniciado.");
