/*
	OPEN CONFIG WHEN ICON IS CLICKED
*/
chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.create({'url': chrome.extension.getURL('config.html'), 'selected': true});
});


/*
	ACCESS LOCAL STORAGE FROM OTHER SITE
*/
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == "getLocalStorage")
      sendResponse({data: localStorage[request.key]});
    else
      sendResponse({}); // snub them.
});


/*
	OPEN CONFIG ON INSTALL
*/
chrome.runtime.onInstalled.addListener(function (object) {
    chrome.tabs.create({url: chrome.extension.getURL('config.html')});
});