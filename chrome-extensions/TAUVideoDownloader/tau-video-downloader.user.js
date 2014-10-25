// ==UserScript==
// @name TAU Video Server Downloader
// @author Galgo
// @match http://video.tau.ac.il/index.php?option=com_videos*
// @match https://video.tau.ac.il/index.php?option=com_videos*
// ==/UserScript==

var debug_mode = true;

function extractUrl(innerHtml)
{
	var re = new RegExp('\'mms://msvideo.tau.ac.il/CMS/(.+?\.wmv)\'');
	var captures = re.exec(innerHtml);
	var url = 'https://video.tau.ac.il/files/' + captures[1];
	return url;
}

function requestDetailsPage(div) {
	// extract url from div
	var url = div.children.item().href;
	url = url.replace('https', 'http');

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
		var filename = extractFilename(div);
		injectButton(div, url, filename);
	}	
}

function extractFilename(div) {
	var lecture = div.outerText.split('\n')[3].split('[')[0].trim();
	var course = div.outerText.split('\n')[1].replace('/', '-');
	return course + ' ' + lecture;
}

function injectButton(div, url, filename) {
	var html = "<BR/><a href=\"" + url + '#' + filename + "\" download>Download Video</a>";
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

function revertToHttp() {
	var location = String(window.location);

	// the details page redirects to HTTP, so we must also run from HTTP
	if(location.indexOf('https') != -1)
	{
		var target = location.replace('https','http');
		window.location = target;
	}
}

try
{
	revertToHttp();
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
