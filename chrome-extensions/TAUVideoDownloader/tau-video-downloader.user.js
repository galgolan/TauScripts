// ==UserScript==
// @name TAU Video Server Downloader
// @author Galgo
// @match http://video.tau.ac.il/index.php?option=com_videos*
// @match https://video.tau.ac.il/index.php?option=com_videos*
// ==/UserScript==

var debug_mode = true;
var course_name = '';
var filesList = [];
var activeRequests = 0;

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
	++activeRequests;
}

function ajaxCallback(req, div) {
	if (req.readyState == 4 && req.status==200)
	{
		--activeRequests;
		// extract url from response
		var url = extractUrl(req.responseText);

		// show in page
		var filename = extractFilename(div);
		injectButton(div, url, filename);

		// create the download all button if finished parsing all URLs
		if(activeRequests <= 0)
			createDownloadAllBtn();
	}	
}

function getCourseName() {
	var title = document.getElementsByClassName('course_title');
	if(title.length == 1)
		course_name = title[0].innerText;
}

function extractFilename(div) {
	var fields = div.outerText.split('\n');
	if(fields.length == 10) {
		// this is the 'New Videos' page
		var lecture = fields[3].split('[')[0].trim();
		var course = fields[1].replace('/', '-');
	}
	else {// fields.length == 8
		// this is a specific course page
		var lecture = fields[1].split('[')[0].trim();
		var course = course_name.replace('/', '-');
	}
	
	return course + ' ' + lecture;
}

function injectButton(div, url, filename) {
	filesList[filesList.length] = {url: url, filename: filename};

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

function createDownloadAllBtn() {
	var div = document.getElementsByClassName("contentpane")[0];
	for(i = 0; i < div.children.length; ++i) {
		var c = div.children[i];
		if(c.tagName == "H3") {
			c.innerHTML += "   <A href='javascript:void(0)'>Download All</A>";
			c.addEventListener('click', downloadAll);
			break;
		}
	}
}

function downloadAll() {
	if(confirm('Are you sure you want to download ' + filesList.length + ' videos?')) {
		// send a message to the background script with the downloads list
		chrome.runtime.sendMessage(filesList);
	}
}

try
{
	revertToHttp();
	getCourseName();	// must be called before we add the 'Download All' link
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
