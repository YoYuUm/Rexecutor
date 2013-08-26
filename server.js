var http = require("http");
var exec = require('child_process').exec;
var url = require("url");
var current;
var play = new player();
var pipe = "/tmp/mystdin"

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
	if (action=="/n"){
		play.next();
	} 
	/*else{
	omx.stdin.write(action);
        }*/
	
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
	/*
	this.convert = function(){
		console.log('Printing link.search(vimeo): '+ link.search("vimeo"));
		if (link.search("vimeo") >= 0 ){
				console.log("Vimeo video");
				var aux = exec('vimeo_url '+link,function callback(error, stdout, stderr){
				console.log("Movidas de Vimeo \nError:" + error + "\nStdout:" + stdout + "\nStderr:" + stderr);
				if (stdout)
					converted = stdout;
					console.log("Converted video link: "+ converted);

			});
		}else{
			console.log("Youtube video");
			var aux = exec('youtube-dl -g '+link,function callback(error, stdout, stderr){
				if (stdout)
					converted = stdout;
					console.log("Converted video link: "+ converted);

			});
		}
	}*/
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
function newVideo(item){
		/*iterator();
		function iterator(){
			if (item.getVideo()){
				console.log("Stopping previous");
				if (play.isOmx()) play.stop();
			 	play.start(item)
			}else{
				console.log("Waiting for link");	
				setTimeout(function(){iterator()},500)
			}
		}*/

		console.log("Stopping previous");
		if (play.isOmx()) play.stop();
		play.start(item)
}

function player(item){
	var omx;
	this.isOmx = function (){
		var bool = false;
		if (omx) bool = true;
		return bool; 

	}
	this.start = function (item){
		console.log("Starting video: "+ item.getLink());
          	current = item;
        var stream;
        //Create some system to dynamically add new downloaders
        if (item.getLink().search("vimeo") >= 0 ){
        	stream="vimeo_downloader.sh "+item.getLink();
        }else if (item.getLink().search("rtmp://") >=0){
        			stream= item.getLink();
        	       }
        	else{
        		stream="youtube-dl "item.getLink()+" -o "+pipe;
        }
		var app= "omxplayer -o hdmi -p "+pipe;
		stream = new exec(stream, function (error,stdout,stderr){
			if (error)
				console.log("Error: "+error);
		});	

		omx = new exec(app , function (error, stdout, stderr){
			console.log("\nError:" + error + "\nStdout:" + stdout + "\nStderr:" + stderr);
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


}

http.createServer(onRequest).listen(8888);

console.log("Servidor Iniciado.");
