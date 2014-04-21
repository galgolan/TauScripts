// ==UserScript==
// @name TAU Video Server Downloader
// @author Galgo
// @match http://video.tau.ac.il/index.php?option=com_videos*
// @match https://video.tau.ac.il/index.php?option=com_videos*
// ==/UserScript==

var debug_mode = true;

function extractUrl(innerHtml)
{
	var re = new RegExp('\'mms(://.+?\.wmv)\'');
	var captures = re.exec(innerHtml);
	var url = 'mmsh' + captures[1];
	return url;
}

function requestDetailsPage(div) {
	// extract url from div
	var url = div.children.item().href;

	var req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		ajaxCallback(req, div);
	};
	req.open("GET", url, true);
	req.send();
	//ajaxCallback(req, div);
}

function ajaxCallback(req, div) {
	if (req.readyState == 4 && req.status==200)
	{
		// extract url from response
		var url = extractUrl(req.responseText);

		// show in page
		injectButton(div, url);
	}	
}

function injectButton(div, url) {
	var html = "<BR/><a href=\"" + url + "\">Video Download Link</a>";
	var detailsPane = div.children[1].children[2];
	detailsPane.innerHTML += html;
}

function handleListView() {
	// for each link in the page, async get it's video page
	videoItems = document.getElementsByClassName("video_item");
	for(i=0; i<videoItems.length; ++i) {
		requestDetailsPage(videoItems[i]);
	}
}

try
{
	handleListView();
}
catch(x)
{
	// Comment this out if you want error messages displayed
	if(debug_mode) {
		var err = new Error();
		err.name = "Unhandled exception in TAU Video Downloader";
		err.message = x.message;
		err.stack = x.stack || x.stacktrace || "";
    	//var myStackTrace = x.stack || x.stacktrace || "";
    	throw(err);
	}
}