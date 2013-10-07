function RaspberryProcess(app){
	var process //Type child.exec
	var running = false; //Type Boolean, yes if process is running
	var events = new EventEmitter();

	events.on("stop",function(){
		console.log(app + "HAS STOPPED")
		running = false;
	})
	events.on("start",function(){
		console.log(app + "HAS STARTED")
		running = true;
	})

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

	this.kill = function(callback){
		if (running){
			var stopped = false;
			events.once("stop",function(stream){
					callback(true)
					stopped = true
			});
			setTimeout(function(){
							if (!stopped){
							 	process.kill('SIGKILL');
							}
			},3000 )
			setTimeout(function(){
							if (!stopped){
								console.log("WARNINIG: Killing "+ app + " second time")
							 	process.kill('SIGKILL');		 	
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

	this.execute = function(app,args,callback){
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



function Omx(){
		
		var args=["-o","hdmi","-p",""]
		var pause = false;
		 //Type Boolean, yes if process is running
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

		
		events.on("pause",function(){
			console.log(app + "HAS TOGGUED PAUSED")
			pause=!pause;
			OMX.pause();
		})

	
		this.play = function(path,callback){
			args[3]=path
			this.execute(args,callback)
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

