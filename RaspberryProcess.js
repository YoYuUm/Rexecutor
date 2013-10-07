function RaspberryProcess(app){
	var process //Type child.exec

}



function Omx(){
		
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
			running = false;
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
			process = new spawn(app,args)
			process.on("close",function(){
				callback(true);
				running = false;
				events.emit('stop');
			})

			process.on('error',function(data){
				console.log("Error: "+data)
			})


		}

		this.execute = function(app,args,callback){
		running = true;
		events.emit("start");
		process = new spawn(app,args)
		process.on("close",function(){
						callback(true)
						events.emit('stop');
					
		})

		process.on('error',function(data){
				console.log("Error: "+data)
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

