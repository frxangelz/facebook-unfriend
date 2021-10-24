var config = {
	enable : 0,
	total : 0,
	interval : 5,
	ignore_list: ''
}

$(document).ready(function(){
	$("#btn_start").click(function(){

			config.enable = 1;

			config.interval = parseInt($("#interval").val());
			if(config.interval == 0) { 
				alert("min interval is 1, default 5 seconds")
				return;
			}
		
			$(this).attr("disabled","disabled");
			$("#btn_stop").removeAttr("disabled");
			config.ignore_list = $("#ta_ignore").val();
			chrome.storage.sync.set({ignore_list: config.ignore_list, interval: config.interval});
			set_status();
	});

	$("#btn_stop").click(function(){

			config.enable = 0;
			$(this).attr("disabled","disabled");
			$("#btn_start").removeAttr("disabled");
			set_status();
	});
	
	
	get_status();
});	

function set_status(){
	
	chrome.runtime.sendMessage({action: "set",
			enable: config.enable,
			ignore_list: config.ignore_list,
			interval: config.interval
		}, function(response){});		

}

function get_status(){
	var $b = $("#btn_start");
	var $b1 = $("#btn_stop");

	chrome.runtime.sendMessage({action: "get"}, function(response){
	
		config.enable = response.enable;
		config.ignore_list = response.ignore_list;
		config.interval = response.interval;
		if(config.interval < 1) { config.interval = 5; }
		
		if (config.enable == 0){
			$b.removeAttr("disabled");
			$b1.attr("disabled","disabled");
		} else {
			$b.attr("disabled","disabled");
			$b1.removeAttr("disabled");
		}
		
		$('#ta_ignore').val(config.ignore_list);
		$('#interval').val(config.interval);
	});
}
