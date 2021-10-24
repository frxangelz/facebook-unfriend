var config = {
	enable : 0,
	total : 0,
	ignore_list: '',
	interval: 0
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
				
    if (request.action == "set"){
		config.enable = request.enable;
		if(config.enable) { 
			// reset counter
			config.total = 0; 
			config.ignore_list = request.ignore_list;
			config.interval = request.interval;
		}
		// notif other tab
		send_enable();
		return;
	}
	
	if(request.action == "get"){
		var message = {
			action: "set", 
			enable: config.enable, 
			total:	config.total,
			ignore_list: config.ignore_list,
			interval: config.interval
		};
		
		sendResponse(message);
		return;
	}
	
	if(request.action == "unfriend"){
		config.total = config.total+request.value;
		sendResponse({total:config.total});
		return;
	}	  

	if(request.action === "log"){
		
		console.log(request.log);
		return;
	}
	
 });
 
 function send_enable(){
 
		chrome.tabs.query({}, function(tabs) {
		var message = {
			action: "set",
			enable: config.enable,
			total: config.total,
			ignore_list: config.ignore_list,
			interval: config.interval
		};
		for (var i=0; i<tabs.length; ++i) {
			chrome.tabs.sendMessage(tabs[i].id, message);
		}
	}); 
 }

 	chrome.storage.sync.get('ignore_list', function(data) {
		if(data.ignore_list ){
			config.ignore_list = data.ignore_list;
			console.log("From config ignore_list : "+config.ignore_list);
		}
	});

 	chrome.storage.sync.get('interval', function(data) {
		if(data.interval ){
			config.interval = data.interval;
			if(config.interval === 0) { config.interval = 5}
			console.log("From config ignore_list : "+config.interval);
		}
	});

