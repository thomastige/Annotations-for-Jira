/*
	CHECK IF RIGHT SITE
*/
var jiraLocation = '';
var values = [];
var stashEnabled;
var notesEnabled;
var cleanupEnabled;
chrome.runtime.sendMessage({method: "getLocalStorage", key: "jiraLocationConfig"}, function(response) {
	jiraLocation = response.data;
});
chrome.runtime.sendMessage({method: "getLocalStorage", key: "dropDownArraysConfig"}, function(response) {
  values = JSON.parse(response.data);
});
chrome.runtime.sendMessage({method: "getLocalStorage", key: "stashConfig"}, function(response) {
	stashEnabled = response.data;
});
chrome.runtime.sendMessage({method: "getLocalStorage", key: "notesConfig"}, function(response) {
	notesEnabled = response.data;
});
chrome.runtime.sendMessage({method: "getLocalStorage", key: "cleanupConfig"}, function(response) {
	cleanupEnabled = response.data;
});

/*
	AGILE BOARD COMBOBOXES / NOTE FIELDS
*/

function save(event){
	if (cleanupEnabled == 'true'){
		cleanUpLocalStorage();
	}
	saveStash();
	saveSaveables();
}

function saveStash(){
	var elements = document.getElementsByClassName("stashNote");
	for (var i=0; i<elements.length; ++i){
		localStorage.setItem(elements[i].getAttribute("id"), elements[i].value);
	}
}

function saveSaveables(){
	var elements = document.getElementsByClassName("saveable");
	for (var i=0; i<elements.length; ++i){
		localStorage.setItem(elements[i].getAttribute("id"), elements[i].value);
	}
}

function createSelectNode(currId, array){
	var select = document.createElement("select");
	select.setAttribute("id", currId + "customSelect" + array);
	select.setAttribute("class", "saveable");
	for (var j=0;j<values[array].length;j++){
		var option = document.createElement('option');
		option.text = values[array][j];
		select.add(option, j);
	}
	select.value= localStorage.getItem(select.getAttribute("id"));
	select.addEventListener("click", save);
	return select;
}

function createInputNode(currId){
	var input = document.createElement("input");
	input.setAttribute("id",currId+ "customInput");
	input.setAttribute("class", "saveable");
	var inputValue = localStorage.getItem(input.getAttribute("id"));
	if (inputValue != 'undefined'){
		input.value = inputValue;
	}
	input.addEventListener("keyup", save);
	return input;
}

function addComponents(){
	var location = window.location.href;
	if (location.indexOf("browse") != -1){
		var currId = document.getElementById("key-val").getAttribute("data-issue-key");
		document.getElementsByClassName("aui-nav-breadcrumbs")[0].appendChild(createCopyPasteButton());
		if (stashEnabled == 'true'){
			document.getElementsByClassName("aui-nav-breadcrumbs")[0].appendChild(createStashButton(getLocationInStash(currId)!=-1));
		}
		for (var counter=0;counter<values.length;counter++){
			document.getElementsByClassName("aui-nav-breadcrumbs")[0].appendChild(createSelectNode(currId, counter));
		}
		if (notesEnabled == 'true'){
			document.getElementsByClassName("aui-nav-breadcrumbs")[0].appendChild(createInputNode(currId));
		}		
		document.getElementById("viewissuesidebar").appendChild(createNotePadComponent(currId));
	}
	else if (location.indexOf("RapidBoard.jspa") != -1){
		var elements = document.getElementsByClassName("ghx-issue-compact");
		for (var i=0;i<elements.length; i++){		
			var curr = elements[i];			
			var rightEdge = curr.childNodes[0].childNodes[1];
			currId = curr.getAttribute("data-issue-key");
			if (notesEnabled == 'true'){
				rightEdge.insertBefore(createInputNode(currId), rightEdge.childNodes[0]);
			}
			for (var counter=0;counter<values.length;counter++){
				rightEdge.insertBefore(createSelectNode(currId, counter), rightEdge.childNodes[counter]);
			}
		}
	}
}

/*
	CREATE BUG STASH
*/

function createStashComponent(){
	var location = window.location.href;
	if (location.indexOf("RapidBoard.jspa") != -1){
		var issues = JSON.parse(localStorage.getItem("CustomIssueStash"));
		if (issues == null){
			localStorage.setItem("CustomIssueStash", JSON.stringify([]));
		}
		
		if (issues != null && issues[0] != null){
			var container = document.createElement("div");
			container.setAttribute("class", "ghx-backlog-container ghx-sprint-active js-sprint-container ghx-open");

			var header = document.createElement("div");
			header.setAttribute("class", "ghx-backlog-header js-sprint-header");
			var expander = document.createElement("div");
			expander.setAttribute("class", "ghx-expander");
			var expanderIcon = document.createElement("span");
			expanderIcon.setAttribute("class", "ghx-iconfont aui-icon aui-icon-small aui-iconfont-expanded");
			
			var nameDiv = document.createElement("div");
			nameDiv.setAttribute("class", "ghx-name");
			var containerLabel = document.createElement("span");
			containerLabel.setAttribute("class", "field-value ghx-readonly");
			containerLabel.textContent = "Bug Stash";

			var issueListContainer = document.createElement("div");
			issueListContainer.setAttribute("class", "ghx-meta ghx-disabled");

			expander.appendChild(expanderIcon);
			header.appendChild(expander);
			nameDiv.appendChild(containerLabel);
			header.appendChild(nameDiv);
			container.appendChild(header);
			
			var issueList = document.createElement("div");
			issueList.setAttribute("class", "ghx-issues js-issue-list ghx-has-issues");
			
			for (var i=0; i<issues.length; ++i){
				issueList.appendChild(createIssueRow(issues[i]));
			}
			container.appendChild(issueList);

			var contentGroup = document.getElementById("ghx-content-group");
			contentGroup.insertBefore(container, contentGroup.childNodes[0]);
		}
	}
}

function createIssueRow(issues){
	var issueKey = issues[0];
	var issueVal = issues[1];
	var div = document.createElement("div");
	div.setAttribute("class", "js-issue ghx-issue-compact ghx-type-52");
	div.setAttribute("data-issue-key", issueKey);
	
	var issueContent = document.createElement("div");
	issueContent.setAttribute("class", "ghx-issue-content");
	
	var row = document.createElement("div");
	row.setAttribute("class", "ghx-row");
	
	var key = document.createElement("div");
	key.setAttribute("class", "ghx-key");
	var keyContent = document.createElement("a");
	keyContent.setAttribute("href", "/browse/" + issueKey);
	keyContent.setAttribute("title", issueKey);
	keyContent.setAttribute("class", "js-key-link");
	keyContent.textContent = issueKey;
	key.appendChild(keyContent);
	row.appendChild(key);
	
	var summary = document.createElement("div");
	summary.setAttribute("class", "ghx-summary");
	summary.setAttribute("title", issueVal);
	var summaryInner = document.createElement("span");
	summaryInner.setAttribute("class", "ghx-inner");
	summaryInner.textContent = issueVal;
	summary.appendChild(summaryInner);
	row.appendChild(summary);
	
	var endRow = document.createElement("div");
	endRow.setAttribute("class", "ghx-end ghx-row");
	var endRowInner = document.createElement("span");
	endRowInner.setAttribute("class", "ghx-end");
	var input = document.createElement("input");
	input.setAttribute("id", "stashNote"+issueKey);
	input.setAttribute("class", "stashNote");
	input.value = localStorage.getItem(input.getAttribute("id"));
	input.addEventListener("keyup", save);
	input.size = 100;
	endRowInner.appendChild(input);
	endRow.appendChild(endRowInner);
	
	issueContent.appendChild(row);
	issueContent.appendChild(endRow);
	div.appendChild(issueContent);
	return div
}

function createStashButton(inStash = false){
	var btn = document.createElement("BUTTON");
	btn.setAttribute("id", "stashButton");
	var label = "stash";
	if(inStash === true){
		label = "destash";
	}
	var text = document.createTextNode(label);
	btn.appendChild(text);
	btn.addEventListener("click", stashButtonListener);
	return btn;
}

function stashButtonListener(){
	var key = document.getElementById("key-val").getAttribute("data-issue-key");
	var label = document.getElementById("summary-val").textContent;
	var issues = JSON.parse(localStorage.getItem("CustomIssueStash"));
	if (issues == null){
		issues = [];
	}
	var loc = getLocationInStash(key);
	if (loc>-1){
		issues.splice(loc, 1);
	} else {
		issues.push([key, label]);
	}
	localStorage.setItem("CustomIssueStash", JSON.stringify(issues));
	toggleButton();
}

function toggleButton(){
	var buttonText = document.getElementById('stashButton').childNodes[0].textContent;
	if (buttonText == "stash"){
		document.getElementById("stashButton").childNodes[0].textContent = 'destash';
	} else {
		document.getElementById("stashButton").childNodes[0].textContent = 'stash';
	}
}

function getLocationInStash(key){
	var issues = JSON.parse(localStorage.getItem("CustomIssueStash"));
	if (issues == null){
		localStorage.setItem("CustomIssueStash", JSON.stringify([]))
		issues = [];
	}
	var location = -1;
	for (var it = 0; it<issues.length; ++it){
		var curr = issues[it];
		if (curr != null){
			if (curr[0] === key){
				location = it;
				break;
			}
		}
	}
	return location;
}

/*
	AUTOMATIC COPY PASTE
*/

function createCopyPasteButton(){
	var btn = document.createElement("button");
	btn.setAttribute("id", "copyButton");
	var label = "copy";
	var text = document.createTextNode(label);
	btn.appendChild(text);
	btn.addEventListener("click", function() {
		var copyFrom = document.createElement("textarea");
		var key = document.getElementById("key-val").getAttribute("data-issue-key");
		var label = document.getElementById("summary-val").textContent;
		copyFrom.textContent = key + "\n" + label;
		var body = document.getElementsByTagName('body')[0];
		body.appendChild(copyFrom);
		copyFrom.select();
		document.execCommand('copy');
		body.removeChild(copyFrom);
		document.getElementById("copyButton").childNodes[0].textContent = 'copied!';
		setTimeout(function() {document.getElementById("copyButton").childNodes[0].textContent = 'copy';}, 1000);
	});
	return btn;
}

/*
	NOTEPAD COMPONENT
*/

function createNotePadComponent(currId){
	var toggleWrap = document.createElement("div");
	toggleWrap.setAttribute("class", "module toggle-wrap");
	var header = document.createElement("div");
	header.setAttribute("class", "mod-header");
	var label = document.createElement("h2");
	label.setAttribute("class", "toggle-title")
	label.textContent = 'Notepad';
	var contentDiv = document.createElement("div");
	contentDiv.setAttribute("class", "mod-content");
	var ul = document.createElement("ul");
	ul.setAttribute("class", "item-details ghx-separated");
	ul.setAttribute("id", "notePadContainer");
	//notepad start	
	
	var notePad = document.createElement("textarea");
	notePad.setAttribute("class", "saveable");
	notePad.setAttribute("id", currId+"notePad");
	var content = localStorage.getItem(notePad.getAttribute("id"));
	if (content != null){
		notePad.value = content;
	}
	notePad.rows = 10;
	notePad.cols = 70;
	notePad.addEventListener("keyup", save);
	
	//notepad end
	ul.appendChild(notePad);
	header.appendChild(label);
	toggleWrap.appendChild(header);
	contentDiv.appendChild(ul);
	toggleWrap.appendChild(contentDiv);
	return toggleWrap;
}

/*
	LOCALSTORAGE CLEAN UP
*/

function cleanUpLocalStorage(){
	var location = window.location.href;
	if (location.indexOf("RapidBoard.jspa") != -1){
		for(var key in localStorage){
			if (key.indexOf('customInput') != -1 || key.indexOf('customSelect') != -1 || key.indexOf('stashNote') != -1){
				localStorage.removeItem(key);
			}
		}
	}
}

/*
	DRIVER FUNCTION
*/
function triggerCustomization(){
	if (jiraLocation != null && jiraLocation != '' && window.location.href.indexOf(jiraLocation) != -1){		
		addComponents();
		if (stashEnabled == 'true'){
			createStashComponent();
		}
	}
}

/*TODO: find more elegant solution*/
setTimeout(triggerCustomization, 750);
