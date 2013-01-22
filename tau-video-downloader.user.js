// ==UserScript==
// @name TAU Video Server Downloader
// @author Galgo
// @version	0.9
// @match https://video.tau.ac.il/index.php?*
// @match https://ivideo.tau.ac.il/index.php?*
// ==/UserScript==

function extractUrl(innerHtml)
{
	var re = new RegExp('\'mms(://.+?\.wmv)\'');
	var captures = re.exec(innerHtml);
	var url = 'mmsh' + captures[1];
	return url;
}

function handleVideoView(doc)
{
	// find the wmv url
	var html = doc.getElementById('video_holder').innerHTML;
	var url = extractUrl(html);

	// write it to the page
	var footer = doc.getElementById('video_holder_footerInner');
	footer.innerHTML += '<BR/>' + url;
}

try
{
	if(String(document.location).indexOf('option=com_videos&view=video') != -1)
	{
		// this is a single video view
		handleVideoView(document);
	}
	else if(String(document.location).indexOf('option=com_videos') != -1)
	{
		// this is a list view, not yet supported :-)		
	}
}
catch(x)
{
	// Comment this out if you want error messages displayed
	
    //var myStackTrace = x.stack || x.stacktrace || "";
	//alert('TAU Auto-login extension encountered an error: '+ x.message + '\n\n' + myStackTrace);
}