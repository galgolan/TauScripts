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
	var url = 'http://video.tau.ac.il/files/' + captures[1];
	return url;
}

function cleanFilename(string) {
	var cleanString = string.replace(/[\|&;\$#%@":<\/>\(\)\+,]/g, " ");
	return cleanString.replace('^','').replace('[','').replace(']','').trim();
}

function requestDetailsPage(div) {
	// extract url from div
	var url = div.children.item().href;
	url = url.replace('https', 'http');

	$.get(url, function(data) {
		--activeRequests;
		// extract url from response
		var url = extractUrl(data);

		// show in page
		var filename = extractFilename(div);
		injectButton(div, url, filename);

		// create the download all button if finished parsing all URLs
		if(activeRequests <= 0)
			createDownloadAllBtn();
	});

	++activeRequests;
}

function extractFilename(div) {
	var fields = div.outerText.split('\n');
	if(fields.length == 10) {
		// this is the 'New Videos' page
		var lecture = fields[3];
		var course = fields[1];
	}
	else {			// fields.length == 8
		// this is a specific course page
		var lecture = fields[1];
		var course = $('.course_title')[0].innerText;
	}

	lecture = lecture.split('[')[0];
	
	return cleanFilename(course.trim() + '-' + lecture.trim());
}

function injectButton(div, url, filename) {
	filesList[filesList.length] = {url: url, filename: filename};

	var html = "<BR/><a href=\"" + url + '#' + filename + "\" download>Download Video</a>";
	var detailsPane = div.children[1].children[2];
	detailsPane.innerHTML += html;
}

function handleListView() {
	// for each link in the page, async get it's video page
	$('.video_item').each(function() {
		requestDetailsPage($(this)[0]);
	});
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
	var c = $('.contentpane:eq(0) > h3')[0];
	c.innerHTML += "   <A href='javascript:void(0)' id='downloadAllLink'>Download All</A>";
	$('#downloadAllLink')[0].addEventListener("click", downloadAll);
}

function downloadAll() {
	if(confirm('Are you sure you want to download ' + filesList.length + ' videos?')) {
		// send a message to the background script with the downloads list
		chrome.runtime.sendMessage(filesList, function(response) {
			// nothing here
		});
	}
}

function registerMessageReceiver() {
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		// error downloading one of the files
		console.error('Error downloading video: ' + JSON.stringify(request));
		alert('Cant download: ' + request.filename);
  	});
}

try
{
	$(document).ready(function() {
		revertToHttp();
		handleListView();
		registerMessageReceiver();
	});	
}
catch(x)
{
	// Comment this out if you want error messages displayed
	if(debug_mode) {
		var err = new Error();
		err.name = "Unhandled exception in TAU Video Downloader";
		err.message = x.message;
		err.stack = x.stack || x.stacktrace || "";
		// TODO: console.log err
    	throw(err);
	}
}
