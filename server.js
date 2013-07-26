var http = require("http");
var exec = require('child_process').exec;
var url = require("url");
var current;
var play = new player();

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

	var item = new items(link);
	console.log("Item "+ item.getLink() + " recibido");
	if (action=="/"){
		if (current) {
		item.setNext(current.getNext());
		}
		current = item;
		newVideo(current);

	}else
	if (action=="/p"){
		console.log("Adding to the queue");
		if (current){
			current.addToQueue(item);
		}else {
			console.log("There is not playlist, starting one");
			newVideo(item);
		}
	}else
	if (action=="/n"){
		play.next();
	} else{
	omx.stdin.write(action);
	
	}
	

}

function items(linkE,nextE){
	var link = linkE;
	var next = nextE;
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
exports.addToQueue = this.addToQueue;
exports.setNext = this.setNext;

}
function newVideo(item){
		console.log("Stopping previous");
		if (play.isOmx()) play.stop();
		console.log("Starting video");
		play.start(item);
}

function player(item){
	var omx;
	this.isOmx = function (){
		var bool = false;
		if (omx) bool = true;
		return bool; 

	}
	this.start = function (item){
		current = item;
		omx = new exec('omxplayer -o hdmi -p  "$(youtube-dl -g '+item.getLink()+')"', function callback(error, stdout, stderr){
		console.log("\nError:" + error + "\nStdout" + stdout + "\nStderr:" + stderr);
	    	if (stdout)
			play.next();
		});
	}
	this.stop = function(){
		exec("sudo kill -9 $(pidof omxplayer.bin)");
	}
	this.next = function(){
		
		if (current.getNext()){
				newVideo(current.getNext());
	    			}
	}

exports.start = this.start;
exports.stop = this.stop;

}

http.createServer(onRequest).listen(8888);

console.log("Servidor Iniciado.");