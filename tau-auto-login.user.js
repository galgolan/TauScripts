// ==UserScript==
// @name TAU auto-login script
// @author Galgo
// @version	1.12
// @match https://vwism.tau.ac.il/login.html*
// @match http://virtual2002.tau.ac.il/loginLinks.asp?*
// @match http://virtual2002.tau.ac.il/sso/AspTimeOutError.asp*
// @match https://idp.tau.ac.il/nidp/idff/sso?*option=credential*
// @match https://iims.tau.ac.il/Tal/Sys/Main.aspx?*
// @match https://citrix.tau.ac.il/Citrix/MetaFrameXP/default/login.asp*
// @match https://www.ims.tau.ac.il/tal/*
// ==/UserScript==

const username = 'israel';
const password = 'israeli';
const id = '123456789';

function handleTalmidLogin()
{
	var form = document.getElementsByName('frmlogin');
	if((form != null) && (form.length == 1))
	{
		document.getElementsByName('user')[0].value = username;
		document.getElementById('id_num').value = id;
		document.getElementsByName('pass')[0].value = password;
		
		form[0].submit();
	}
}

function checkVirtualLoginForm()
{
	// determine if a login is needed, check for the existance of the form
	if(document.getElementsByName('NewLinks') != null)
	{
		var rightDoc = document;
		var form = rightDoc.getElementsByName('fLog');
		if((form != null) && (form.length==1))
		{
			// a login form exists, set its values and submit
			rightDoc.getElementsByName('userID')[0].value = username;
			rightDoc.getElementsByName('password')[0].value = password;
			document.location.href = "javascript:window.updateLang('972')";
		}
		else
		{
			// it's not a login
			return;
		}
	}
	else
	{
		if(String(document.location).indexOf('AspTimeOutError.asp?') != -1)
		{
			alert('Referrer: ' + document.referrer);
			document.location = document.location; // refresh to show login page
		}
		//if(document.body.innerHTML.indexOf('זמן שהייתך במערכת עבר'))
		{
			// credentials expired, refresh the page to
			
		}
	}
}

function handleMyTauLogin()
{
	// make sure its the credentials frame
	var form = document.getElementsByName('IDPLogin');
	if((form != null)&&(form.length==1))
	{
		document.getElementsByName('Ecom_User_ID')[0].value = username;
		document.getElementsByName('Ecom_Password')[0].value = password;
		document.getElementsByName('Ecom_User_Pid')[0].value = id;

		document.location.href = "javascript:window.imageSubmit()";
	}
}

function handlePersonalInfoLogin()
{
}

function handleVirtualLogin()
{
	checkVirtualLoginForm();
}
	
function handleWifiLogin()
{
	if(String(document.location).indexOf('?redirect=')==-1)
	{
		// login page with no target, weird. login anyway
	}
	
	if(document.body.innerHTML.indexOf('The User Name and Password combination you have entered is invalid.') != -1)
	{
		// invalid user name and password, dont auto-fill because we can cause an infinite loop
		return;
	}

	
	var messageObjects = document.getElementsByName('info_msg');
	if((messageObjects != null) && (messageObjects.length==1))
	{
		if(messageObjects[0].value.indexOf('You are already logged in') != -1)
		{
			// redirect to target or notify user he's an idiot
			//alert('already logged in.');
			//return;
		}
		
		// perform login
		document.getElementsByName('password')[0].value = password;
		document.getElementsByName('username')[0].value = username;
		document.getElementsByName('Submit')[0].click();
	}
	
	// login form was not found, do nothing
}

function handleCitrixLogin()
{
	var states = document.getElementsByName('state');
	if((states != null) && (states.length == 1))
	{
		if(states[0].value == 'LOGIN')
		{
			document.getElementsByName('user')[0].value = username;
			document.getElementsByName('password')[0].value = password;
			document.getElementsByName('NFuseForm')[0].submit();
		}
	}
}

try
{
	var uri = String(document.location);
	
	// determine page type
	if(uri.indexOf('virtual2002.tau.ac.il') != -1)
		handleVirtualLogin();
	else if(uri.indexOf('vwism.tau.ac.il') != -1)
		handleWifiLogin();
	else if(uri.indexOf('idp.tau.ac.il') != -1)
		handleMyTauLogin();
	else if(uri.indexOf('iims.tau.ac.il') != -1)
		handlePersonalInfoLogin();
	else if(uri.indexOf('citrix.tau.ac.il') != -1)
		handleCitrixLogin();
	else if(uri.indexOf('ims.tau.ac.il/tal') != -1)
		handleTalmidLogin();
}
catch(x)
{
	// Comment this out if you want error messages displayed
	
    //var myStackTrace = x.stack || x.stacktrace || "";
	//alert('TAU Auto-login extension encountered an error: '+ x.message + '\n\n' + myStackTrace);
}