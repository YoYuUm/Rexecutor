function Stream(){
	
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
		process = new spawn(app,args)
		process.on("close",function(){
						running = false;
						events.emit('stop');
					
		})
		process.on('error',function(data){
				console.log("Error: "+data)
			})
		
		
	}
}

