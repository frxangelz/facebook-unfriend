/*
	Simple script - facebook unfollower/unfriend
	(c) FreeAngel - 2021
	https://www.youtube.com/channel/UCqRqvw9n7Lrh79x3dRDOkDg
*/

/* you can edit this value ----------------------------------------------------- */

const interval = 1000;		// in milliseconds
var wait_delay = 5;		// in seconds
const reload_after_unlike = 40;				// reload after unfriend > 40
var ignore_names = [];
/* ----------------------------------------------------------------------------- */

const _NO_SECTION_TIMEOUT = 120; // every 120 secs (two minutes) if no item found will reload the page
cur_tick = 0;
no_section = false;
unlike_count = 0; // action / section / account
enable = 0;
total = 0;

var first = true;
    
	   var readyStateCheckInterval = setInterval(function() {

	   if (document.readyState === "complete") {

	    cur_tick += interval/1000;
		
		if(first){
			// if reload executed, get info from background
			first = false;
			chrome.runtime.sendMessage({
				action:"get"
			}, function(response){
				enable = response.enable;
				if(enable){
					total = response.total;
				} else {
					var info = document.getElementById("info_ex");
					if(info) {
						info.parentNode.removeChild(info);
					}			
				}
		
				var str = response.ignore_list;
				ignore_names = str.split(",");
				
				wait_delay = response.interval;
				if(wait_delay < 1) { wait_delay = 5;}
			});
			
			return;
		}
		   
		if(!enable) { return; }
		   
		show_info();
		DoJob();

		console.log("Wait ...");
	   }
	}, interval);
	
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	
    if (request.action == "set"){
		enable = request.enable;
		if(enable){
			total = 0; 
		} else {
			var info = document.getElementById("info_ex");
			if(info) {
				info.parentNode.removeChild(info);
			}			
		}
		
		var str = request.ignore_list;
		ignore_names = str.split(",");
		
		wait_delay = request.interval;
		if(wait_delay < 1) { wait_delay = 5;}
		
		return;
	}
	  
  });

function DoJob(){

	if(cur_tick < wait_delay ) { 
		info("Wait "+(wait_delay - cur_tick).toString());
		return; 
	}

	var cur_url = window.location.href;
	
	if(no_section) { 
	
		if (cur_tick >= _NO_SECTION_TIMEOUT) { console.log("reloading page ..."); window.location.href = cur_url; }
		return; 
	}

	cur_tick = 0;
	
	if(cur_url.indexOf("facebook.com") === -1) { return; }
	if(cur_url.indexOf("/friends") === -1) { 
		return; 
	}
	
	if(unlike_count >= reload_after_unlike) { console.log("reloading page ..."); window.location.href = cur_url; }
	
	QuerySection();
}

function QuerySection(){
	//bp9cbjyn ue3kfks5 pw54ja7n uo3d90p7 l82x9zwi n1f8r23x rq0escxv j83agx80 bi6gxh9e discj3wi hv4rvrfc ihqw7lf3 dati1w0a gfomwglr	
	var section = document.querySelectorAll('div.gfomwglr');
	if((!section) || (section.length < 1)) { 
		console.log("Section Not Found !");
		no_section = true; 
		return; 
	}
	
	var sign = null;
	var img = null;
	var uname = "";
	var lastSection = null;
	var found = 0;
	
	for(var i=0; i<section.length; i++){
	
		lastSection = section[i];
		img = section[i].getElementsByTagName("img");
		if(img === null) { console.log("no img tag found !"); break; }
		sign = section[i].getAttribute("signed");
		if(sign === "1"){ 
			//console.log("already signed");
			continue;
		}

		section[i].setAttribute("signed",1);
		
		uname = getUser(section[i]);
		console.log(uname);
		if(isIgnored(uname)){
			console.log("ignored");
			continue;
		}
		
		found++;
		var btn = section[i].querySelector('div[aria-label="Friends"]');
		if(!btn) { continue; }
		unlike_count++;
		btn.click();
		UnFollow(section[i]);
		
		break;
	}
	
	if(lastSection) { lastSection.scrollIntoView(); }
	
	if(found < 1) { 
		console.log("No Item found");
		no_section = true; 
	}
}

function getUser(sec){
	
	var div = sec.querySelectorAll('span[dir="auto"]');
	if(!div) { return ""; }
	var s = div[0].textContent;
	if(s) {	return s.trim(); } else { return ""; }
}

function UnFollow(sec){
	
	var span = document.querySelectorAll('span[dir="auto"]');
	var txt = '';
	for(var i=0; i<span.length; i++){
		txt = span[i].textContent;
		
		if(txt === "Unfriend"){
				
			//console.log("Unfriend clicked !");
			//span[i].textContent = "UnfriendX";
			span[i].click();
			setTimeout(function(){
				var div = document.querySelector('div[aria-label="Confirm"]');
				if(div) { div.click();}
			},500);

			total++;
			chrome.runtime.sendMessage({
				action: "unfriend",
				value: 1
			});
				
			info('');
			break;
		}
	}	
}

function isIgnored(uname){

	var b = false;
	for(var i=0; i<ignore_names.length; i++){
		
		var s = ignore_names[i].trim();
		if(uname === s){
			
			b = true;
			break;
		}
	}
	
	return b;
}

function show_info(){

	var info = document.getElementById("info_ex");
	if(!info) {
	
		info = document.createElement('div');
		info.style.cssText = "position: fixed; bottom: 0; width:100%; z-index: 999;background-color: #F5FACA; border-style: solid;  border-width: 1px; margins: 5px; paddingLeft: 10px; paddingRight: 10px;";
		info.innerHTML = "<center><h3 id='status_ex'>active</h3></center>";
		info.id = "info_ex";
		document.body.appendChild(info);
		console.log("info_ex created");
	}
}

function info(txt){

	var info = document.getElementById("status_ex");
	if(!info) { return; }
	if(txt != ''){
		info.textContent = "Unfriend : "+total+", "+txt;
	} else {
		info.textContent = "Unfriend: "+total;
	}
}
