var http = require("http");
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var url = require("url");
var fs = require('fs');
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
		var item = new items(link);
		if (current) {
		item.setNext(current.getNext());
		}
		//Wipe current?
		current = item;
		newVideo(current);

	}else
	if (action=="/p"){
		var item = new items(link);
		console.log("Adding to the queue");
		if (current){
			current.addToQueue(item);
		}else {
			console.log("There is not playlist, starting one");
			newVideo(item);
		}
	}else
	if (action=="/cmd"){
		OMX.cmd(link);
	} 
}
	



function items(linkE,callback){
	var link = linkE;
	var next;
	var converted;
	this.addToQueue = function(item){
		if (next) {
			next.addToQueue(item);
		}else{
			next = item;
		}
	}

	this.setNext = function (nextA){
		next = nextA
	}
	this.getNext = function (){
		return next;
	}
	this.getLink = function(){
		return link;
	}
	this.getVideo = function(){
		return converted;
	}
	//this.convert();

}

http.createServer(onRequest).listen(8888);

console.log("Servidor Iniciado.");
