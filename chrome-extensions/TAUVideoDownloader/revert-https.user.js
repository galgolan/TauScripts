// revert from https to http
if(window.location.protocol == 'https:')
{
	window.location = String(window.location).replace('https','http');
}