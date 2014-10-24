// ==UserScript==
// @name Moodle Tab Renamer
// @author Galgo
// @version	1.2
// @match http://moodle.tau.ac.il/pluginfile.php/*.pdf
// ==/UserScript==

debug_mode = false;
show_extension = false;
clean_filename = false;

// Extracts filename and extension from URL
function getFilename()
{
	var url = String(window.location);
	// extract the filename from the URL
	var re = new RegExp(/.+:\/\/.+\/(.+)\.(.+)/);
	var matches = re.exec(url);
	if(matches.length != 3) return null;	// TODO: throw an exception so it would be visible in console

	if(show_extension) return matches[1] + "." + matches[2];
	else return matches[1];
}

// Gets the filename without extension
// Returns the celan filename
function cleanFilename(filename) {
	return filename.replace(/\_/g, " ").replace(/-/g, " ");
}

// Sets the window/tab title
function changeTitle(newTitle) {
	document.title = decodeURIComponent(newTitle);
}

function loadSettings() {
	chrome.storage.sync.get({
    	debugMode: true,
    	showExtension: false,
    	cleanFilename: false
  	}, function(items) {
    	debug_mode = items.debugMode;
    	show_extension = items.showExtension;
    	clean_filename = items.cleanFilename;
  	});
}

try
{
	loadSettings();

	var filename = getFilename();
	if(filename != null) {
		if(clean_filename)
			filename = cleanFilename(filename);

		changeTitle(filename);
	}
}
catch(x)
{
	if(debug_mode) {
		var err = new Error();
		err.name = "Unhandled exception in Moodle Tab Renamer";
		err.message = x.message;
		err.stack = x.stack || x.stacktrace || "";
    	throw(err);
	}
}