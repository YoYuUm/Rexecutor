var service = require("./Service")
var current;

global_events.on("play",function(link){
	
		var item = new Item(link);
		if (current) {
		item.setNext(current.getNext());
		}
		//Wipe current?
		current = item;
		service.new_video(current);

})

global_events.on("queue",function(link){

	var item = new Item(link);
	console.log("Adding to the queue");
	if (current){
		current.addToQueue(item);
	}else {
		console.log("There is not playlist, starting one");
		service.new_video(item);
	}
})


function Item(linkE){
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