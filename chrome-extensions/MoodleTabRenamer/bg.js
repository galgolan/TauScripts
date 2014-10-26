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

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
	loadSettings();

	var filename = getFilename();
	if(filename != null) {
		if(clean_filename)
			filename = cleanFilename(filename);

		
	}
})