// ==UserScript==
// @name TAU Video Server Downloader
// @author Galgo
// @match http://video.tau.ac.il/index.php?option=com_videos*
// @match https://video.tau.ac.il/index.php?option=com_videos*
// ==/UserScript==

var debug_mode = true;

function post_to_url(path, params, method)
{
    method = method || "post"; // Set method to post by default, if not specified.

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);
    //form.setAttribute("target", "_self");
    form.setAttribute("enctype", "application/x-www-form-urlencoded");

    for(var key in params)
    {
        if(params.hasOwnProperty(key))
        {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
         }
    }

    document.body.appendChild(form);
    form.submit();
}

function loginToSso() {
	var username='galgolan';
	var password='pil4Pel6';
	var userid = '200137206';

	post_to_url('https://nidp.tau.ac.il/nidp/saml2/sso?sid=1', {'Ecom_User_ID':username, 'Ecom_User_Pid':userid, 'Ecom_Password':password, 'option':'credential'}, 'post');
}

function extractUrl(innerHtml)
{
	var re = new RegExp('\'mms://msvideo.tau.ac.il/CMS/(.+?\.wmv)\'');
	var captures = re.exec(innerHtml);
	var url = 'https://ivideo.tau.ac.il/files/' + captures[1];
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
		injectButton(div, url);
	}	
}

function injectButton(div, url) {
	var html = "<BR/><a href=\"" + url + "\" download>Download Video</a>";
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
	//loginToSso();
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
