var RP = require("./RaspberryProcess");
var Omx = require("./Omx")
var Stream = require("./Stream")
var OMX = new Omx.Omx();
var STREAM = new Stream.Stream();;
var pipe = "/tmp/mystdin"

//Events



function new_video(item){
		var omxR = false;
		var streamR = false;
		var pipeR = false;
		var events = new EventEmitter();


		var aux = new exec("sudo rm "+pipe,function(){
			var aux2 = new exec("mkfifo "+pipe,function(error){
				if (error)
					console.log("Warning, pipe not created")
				else
					console.log("pipe "+pipe+" is ready");
					pipeR = true;
					events.emit("pipe_ready")
			})
		})


		global_events.on("omx_cmd",function(cmd){
           OMX.cmd(cmd);
        })


		var start = function(link){
			console.log("Starting repro")
			STREAM.start(link,function(path){
				console.log("Stream finnished, omx now")
				OMX.play(app,path,function(ended){
					console.log("Omx finnished checking next")
					if (current.getNext()){
						console.log("Next founded")
						newVideo(current.getNext());
	    			}
				});
			})
		}

		var ready = function(name){
			console.log("once "+name)
			if (streamR && omxR && pipeR)
				start(item.getLink())
		}
		events.once("omx_ready",function(){
			ready("OMX ready")
			})
		events.once("pipe_ready",function(){
			ready("Pipe ready")
			})
		events.once("stream_ready",function(){
			ready("STREAM ready")
			})


		OMX.set_ready(function(ready){
			if (ready){
				omxR = true;
				console.log("OMX is ready");
				events.emit("omx_ready");
			}else{
				console.log("OMX is invencible! you can not just close it ... :'(")
			}
		});

		STREAM.set_ready(function(ready) {
			if (ready){
				streamR = true
				console.log("STREAM is ready");
				events.emit("stream_ready")
				
			}else{
				console.log("Error killing the STREAM")
			}
		})
}


exports.new_video = new_video;
