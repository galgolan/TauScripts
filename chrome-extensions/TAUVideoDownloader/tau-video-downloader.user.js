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
var courseList = [];

function extractCourseMap() {
	var scripts = $('script');
	for(i=0; i<scripts.length;++i)
	{
		var script = scripts[i];
		var re = new RegExp(/JSON.decode\('(.+)'\);/g);
		var captures = re.exec(script.innerText);
		if(captures == null)
			continue;
		
		var courseMap = JSON.parse(captures[1]);
		
		// flatten dictionary to array of value-label objects
		courseList = $.map(courseMap, function(v,k) {
			return $.map(v, function(ov,ok) {
				return { value:k+'.'+ov.value, label:ov.text}
			})
		});

		// filter invalid items
		courseList = $.grep(courseList, function(item) {
			return (item.value.indexOf('null') == -1);
		});
		
		break;
	}
}

function addSearchBox() {
	// JQuery UI required dependency
	$('head')[0].innerHTML += "<link rel='stylesheet' href='//code.jquery.com/ui/1.11.2/themes/smoothness/jquery-ui.css'>";	

	var groupDetails = $('#group_details')[0];
	
	// add new UI elements
	var newHTML = "<input type='text' id='searchbox' placeholder='או הקלד שם קורס לחיפוש' />"	// todo: make 400px wide	
	+ "<input value='בחירה' type='submit' id='go' class='tau-scripts-button' />"
	// add fields which will be submitted
	+ "<input type='hidden' name='course_id' id='course_id_field' value='' />"
	+ "<input type='hidden' name='dep_id' id='dep_id_field' value='' />";

	groupDetails.innerHTML += newHTML;

	// init search box
	$("#searchbox").autocomplete({
      	source: courseList,
      	focus: function(event, ui) {
			// prevent autocomplete from updating the textbox
			event.preventDefault();
			// manually update the textbox
			$(this).val(ui.item.label);
		},
		select: function(event, ui) {
			// prevent autocomplete from updating the textbox
			event.preventDefault();
			// manually update the textbox and hidden field
			$(this).val(ui.item.label);
			
			// set the form's hidden fields
			var ids = ui.item.value.split('.');
			$('#dep_id_field')[0].value = ids[0];
			$('#course_id_field')[0].value = ids[1];
		}
    });
}

function hideOldSearchUI() {
	var groupDetails = $('#group_details')[0];
	groupDetails.innerHTML = "";
}

function extractNewStyleUrl(innerHtml)
{
	var re = new RegExp('\"rt[sm]p:\/\/vod\.tau\.ac\.il:80\/.+\/\_definst\_\/mp4:(.+?\.mp4)\"');
	var captures = re.exec(innerHtml);
	if(captures == null)
		return null;			// unknown page
	
	var url = 'http://video.tau.ac.il/files/' + captures[1];
	return url;
}

function extractUrl(innerHtml)
{
	var re = new RegExp('\'mms://msvideo.tau.ac.il/CMS/(.+?\.wmv)\'');
	var captures = re.exec(innerHtml);
	if(captures == null)
		return extractNewStyleUrl(innerHtml);
	
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
		if(url == null)
			return;

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
	var fullName = filename + "." + url.split('.').pop();
	filesList[filesList.length] = {url: url, filename: fullName};

	var html = "<BR/><a href=\"" + url + '#' + fullName + "\" download>Download Video</a>";
	var detailsPane = div.children[1].children[2];
	detailsPane.innerHTML += html;
}

function handleListView() {
	// for each link in the page, async get it's video page
	$('.video_item').each(function() {
		requestDetailsPage($(this)[0]);
	});
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

function getUrlParameters()
{
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = pair[1];
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]], pair[1] ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(pair[1]);
    }
  } 
    return query_string;
}

try
{
	// skip if page is the video player
	var urlParams = getUrlParameters();
	if(urlParams["view"] != "video")
	{	
		$(document).ready(function() {	
			handleListView();
			registerMessageReceiver();
			extractCourseMap();
			//hideOldSearchUI();
			addSearchBox();
			
		});	
	}
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
