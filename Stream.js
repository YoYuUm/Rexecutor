function Stream(){
	
		
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
        	this.execute("/home/pi/Desktop/repos/youtube/youtube-dl/youtube-dl", ["--no-cache-dir","--no-continue",url, "-o",pipe]);
        	break;
        case 1:
        	console.log("RTMP Steam detected")
        	path = url
        	break;
       	case 2:
       		console.log("Vimeo link detected")
        	this.execute("vimeo_downloader.sh",[url]);
        	break
        default:
        	path=url
        }

        callback(path)
	}

}

