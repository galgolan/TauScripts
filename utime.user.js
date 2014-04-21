// ==UserScript==
// @name uTime link adder
// @author Galgo
// @version	0.9
// @match https://www.ims.tau.ac.il/Tal/TL/Marechet_L.aspx?*
// ==/UserScript==

function idPage()
{
	return (document.getElementById("LblPage").innerText == "מערכת שעות");
}

function createLinks()
{
	baseUrl = "http://google.com/search?btnI=1&q=site:utime.co.il%20";	

	table = document.getElementsByTagName("table")[1].tBodies[0];
	for(i=1; i<table.rows.length-1; ++i)
	{
		var row = table.rows[i];
		var courseNumCell = row.cells[9];
		if(courseNumCell != null)
		{

			var courseId = courseNumCell.innerText;
			var searchString = baseUrl + courseId;

			// TODO: add target to link
			courseNumCell.innerHTML = "<A HREF=\"" + searchString + "\" />" + courseId + "</A>";
		}
	}
}

try
{
	if(idPage())
		createLinks();
}
catch(x)
{
	// Comment this out if you want error messages displayed
	
    //var myStackTrace = x.stack || x.stacktrace || "";
	//alert('TAU Auto-login extension encountered an error: '+ x.message + '\n\n' + myStackTrace);
}