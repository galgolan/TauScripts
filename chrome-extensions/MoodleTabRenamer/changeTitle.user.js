// ==UserScript==
// @name Chrome Tab Auto Renamer
// @author Galgo
// @version	1.2
// @match http://moodle.tau.ac.il/pluginfile.php/*.pdf
// ==/UserScript==

debug_mode = false;

chrome.storage.sync.get({
    debugMode: true
  }, function(items) {
    debug_mode = items.debugMode;
  });

function getFilename()
{
	var url = String(window.location);
	// TODO: extract the filename from the URL
	var re = new RegExp(/.+:\/\/.+\/(.+\..+)/);
	var matches = re.exec(url);
	if(matches.length != 2) return null;

	return matches[1];
}

function changeTitle(newTitle) {
	document.title = decodeURIComponent(newTitle);
}

try
{
	var filename = getFilename();
	if(filename != null)
		changeTitle(filename);
}
catch(x)
{
	// Comment this out if you want error messages displayed
	if(debug_mode) {
		var err = new Error();
		err.name = "Unhandled exception in Moodle Tab Renamer";
		err.message = x.message;
		err.stack = x.stack || x.stacktrace || "";
    	//var myStackTrace = x.stack || x.stacktrace || "";
    	throw(err);
	}
}