// event listener to override response header
chrome.webRequest.onHeadersReceived.addListener(
	function(details) {
		//console.log(JSON.stringify(details));
		var filename = map[details.requestId];
		// handle not in map
		if(typeof filename === 'undefined') {
			return {responseHeaders: details.responseHeaders};
		}
		
		// iterate over all headers and look for ETag
		details.responseHeaders.forEach(function(v,i,a) {
			
			if(v.name == "ETag") {       							
       			details.responseHeaders.splice(i,1);    // remove the ETag because Chrome always gives it priority
      		}
    	});

		details.responseHeaders.push({name:"Content-Disposition",value:"attachment; filename=\"" + filename + "\""});
		return {responseHeaders: details.responseHeaders};
	},
	{urls: ["*://video.tau.ac.il/files/*wmv", "*://video.tau.ac.il/files/*mp4"]},
	["blocking","responseHeaders"]
);

var map = {};

// event listener to insert custom filename header
chrome.webRequest.onBeforeSendHeaders.addListener(
	function(details) {
		//console.log(JSON.stringify(details));
		var fields = details.url.split('#');
		if(fields.length != 2)
			return {requestHeaders: details.requestHeaders};

		var filename = fields[1];

		//details.requestHeaders.push({name:"X-TauScripts-Filename",value:filename});
		map[details.requestId] = filename;
		return {requestHeaders: details.requestHeaders};
	},
	{urls: ["*://video.tau.ac.il/files/*wmv", "*://video.tau.ac.il/files/*mp4"]},
	["blocking","requestHeaders"]
);

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {

    	for(i = 0; i < request.length; ++i) {
			var item = request[i];

			chrome.downloads.download({url: item.url, filename: item.filename, saveAs:false}, function(downloadId) {
				// check if the download was queued successfully
				if(typeof downloadId === 'undefined') {

					// send the error message back to the content script
					chrome.tabs.sendMessage(sender.tab.id, item);
				}
			});
		}
  	}
);