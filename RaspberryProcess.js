function RaspberryProcess(name){
	var process //Type child.exec
	var running = false; //Type Boolean, yes if process is running
	var events = new EventEmitter();

	events.on("stop",function(){
		console.log(name + "HAS STOPPED")
		running = false;
	})
	events.on("start",function(){
		console.log(name + "HAS STARTED")
		running = true;
	})

	this.set_ready = function(callback){
		
		this.kill(function (success){
			if (success){
				callback(true);
			}else{
				console.log("Impossible to close previous" + name + " instance")
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
								console.log("WARNINIG: Killing "+ name + " second time")
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
						if (callback)
							callback(true)
						events.emit('stop');
					
		})
		process.on('error',function(data){
			console.log("Error: "+ data)
		})

}
exports.RaspberryProcess = RaspberryProcess;