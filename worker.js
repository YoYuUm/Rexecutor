var OMX = new Omx();
var STREAM = new Stream();
var EventEmitter = require("events").EventEmitter
var pipe = "/tmp/mystdin"

function newVideo(item){
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


		var start = function(link){
			console.log("Starting repro")
			STREAM.start(link,function(path){
				console.log("Stream finnished, omx now")
				OMX.play(path,function(ended){
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


function Omx(){
		var process //Type child.exec
		var app="omxplayerb"
		var args=["-o","hdmi","-p",""]
		var running = false;
		var pause = false;
		var events = new EventEmitter(); //Type Boolean, yes if process is running
		var hdmi = spawn("tvservice",["-M"]);

		hdmi.stderr.on("data",function(data){
			var string = data.toString()
			console.log("HDMI DATA" + string)
			if (string.search("unplugged") >= 0)
				if (!pause){
					console.log("HDMI OFF")
					events.emit("pause");
				}
			if (string.search("standby") >= 0)
				if (pause){
					setTimeout(function(){
						console.log("HDMI ON")
						events.emit("pause");
					},3000)
				}
		})

		
		events.on("stop",function(){
			console.log("OMX HAS STOPPED")
		})
		events.on("start",function(){
			console.log("OMX HAS STARTED")
		})
		events.on("pause",function(){
			console.log("OMX HAS TOGGUED PAUSED")
			pause=!pause;
			OMX.pause();
		})

		this.kill = function(callback){
			if (running){
				var stopped = false;
				events.once("stop",function(stream){
						console.log("Im the event stop and I have heard you stopping")
						callback(true)
						stopped = true
				});
				console.log("Killing OMX softly");
				OMX.cmd("q");
				setTimeout(function(){
								if (!stopped){
									console.log("Assesinating OMX");
								 	process.kill('SIGKILL');
								}
				},3000 )
				setTimeout(function(){
								if (!stopped){
									console.log("Asessinating OMX badly");
								 	exec("sudo kill -9 $(pidof omxplayer.bin)");		 	
								}
				},4000 )
				setTimeout(function(){
								if (!stopped){
								 	callback(false);
							}
				},5000 )
			}else{
				callback(true)
			}
		}

		this.set_ready = function(callback){
			this.kill(function (success){
				if (success){
					callback(true);
				}else{
					console.log("Impossible to close previous OMX instance")
					callback(false);
				}
			})
		}

		this.play = function(path,callback){
			args[3]=path
			running = true;
			events.emit("start");
			console.log("Playing "+path)
			process = new spawn(app,args)
			process.on("close",function(){
				callback(true);
				running = false;
				events.emit('stop');
				console.log(path+" Stoped")
				//if (error)
				//	console.log("\nOMX Error:" + error + "\nStdout:" + stdout + "\nStderr:" + stderr);
			})

			process.on('error',function(data){
				console.log("Error: "+data)
			})

			process.stdout.on('data',function(data){
				console.log("==========OMX STDOUT========")
				console.log(data.toString())
				console.log("=================")
			})
			process.stderr.on('data',function(data){
				console.log("==========OMX STDERR========")
				console.log(data.toString())
				console.log("=================")
			})

		}

		this.pause = function(){
			if (running){
				process.stdin.write("p");
			}
		}
		this.cmd = function(cmd){			
			if (running){
				if (cmd=="p")
					events.emit("pause")
				else 
					process.stdin.write(cmd);
				
			}

		}
}

function Stream(){
		var process //Type child.exec
		
		var running = false; //Type Boolean, yes if process is running
		var events = new EventEmitter(); 
		
		this.kill = function(callback){
			if (running){
				var stopped = false;
				events.once("stop",function(stream){
						console.log("Im an event and I heard you have stop the STREAM");
						callback(true)
						stopped = true
				});
				process.kill("SIGINT");
				setTimeout(function(){
								if (!stopped){
								 	process.kill('SIGKILL');
									}
						},3000 )
				setTimeout(function(){
								if (!stopped){
									exec('sudo -9 kill $(pidof youtube-dl vimeo_downloader)');
									}
						},4000 )
				setTimeout(function(){
								if (!stopped){
								 	callback(false);
									}
						},5000 )

			}else{
				callback(true);
			}
		}

		this.set_ready = function(callback){
			this.kill(function (success){
				if (success){
					callback(true)
				}else{
					console.log("Can not close previous Streamer instance")
					callback(false);
				}
			})
		}

		this.start = function(url,callback){

			this.getPath(url,function(path){
								callback(path);
							})
		}

		this.getPath = function(url,callback){
		console.log("im in getPath");

		var filters = [
						"http://",
						"rtmp://",
						"vimeo"]

		//Create some system to dynamically add new downloaders
		
		var path = pipe

		var option;

		for (var i=0;i<filters.length;i++){
			if (url.search(filters[i]) >=0){
				option = i;
			}

		}

		
		switch (option){
        case 0:
        	console.log("Youtube-dl link detected")
        	this.setStream("/home/pi/Desktop/repos/youtube/youtube-dl/youtube-dl", ["--no-cache-dir","--no-continue",url, "-o",pipe]);
        	break;
        case 1:
        	console.log("RTMP Steam detected")
        	path = url
        	break;
       	case 2:
       		console.log("Vimeo link detected")
        	this.setStream("vimeo_downloader.sh",[url]);
        	break
        default:
        	path=url
        }

        callback(path)
	}

	this.setStream = function(command,args){
		console.log("Im in set stream");
		running = true;
		events.emit("start");
		console.log("Command of STREAM is: " + command)
		process = new spawn(command,args)
		process.on("close",function(){
						running = false;
						events.emit('stop');
						//if (error)
						//	console.log("\nSTREAM Error:" + error + "\nStdout:" + stdout + "\nStderr:" + stderr);
		})
		process.on('error',function(data){
				console.log("Error: "+data)
			})
		process.stdout.on('data',function(data){
				console.log("==========STREAM STDOUT========")
				console.log(data.toString())
				console.log("=================")
			})
		process.stderr.on('data',function(data){
				console.log("==========STREAM STDERR========")
				console.log(data.toString())
				console.log("=================")
			})
		
	}
}

