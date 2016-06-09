/*
IMPORT
 */

/*
CONSTANT STRINGS
 */

const STASH_NOTE_CLASSNAME = "stashNote";
const SAVEABLE_CLASSNAME = "saveable";
const CLASS_DROPDOWN = "dropdown";
const CUSTOM_SELECT_ID = "customSelect";
const CUSTOM_INPUT_ID = "customInput";
const NOTEPAD_ID = "notePad";
const NOTENAME_PREFIX = "JIRANOTE__";
const NOTENAME_SEPARATOR = "__";
const ANNOTATION_SAVE_DATA = "annotationSaveData";
const CONFIG_SAVE_DATA = "configurationData";

const CONFIG_JIRA_LOCATION = "jiraLocationConfig";
const CONFIG_DROP_DOWN_VALUES = "dropDownArraysConfig";
const CONFIG_DROP_DOWN_MAPPINGS = "dropDownMappings";
const CONFIG_ENABLED_METADATA_BOXES = "enabledBoxesConfig";
const CONFIG_NOTES_ENABLED = "notesConfig";
const CONFIG_CLEANUP_ENABLED = "cleanupConfig";
const CONFIG_DETAILS_PANEL_DISABLED = "detailConfig";
const CONFIG_CUSTOM_DATA_NOTES = "customDataConfig";
const CONFIG_STASH_ENABLED = "stashConfig";
const CONFIG_DD_COLORS_ENABLED = "colorsEnabled";
const CONFIG_TEXT_SAVE_MODE = "textSaveMode";
const CONFIG_WATCHER_BLUR = "watcherBlur";

const DEFAULT_DROPDOWN_COLOR = "white";
const DEFAULT_ROW_COLOR = "white";
const DEFAULT_FONT_COLOR = "#333";

// Variables. Some of them need default values.
var configurationData = {};
var triggerDelay;
var jiraLocation;
var values;
var dropDownMappings;
var downloadMetadata;
var stashEnabled;
var notesEnabled;
var cleanupEnabled;
var detailDisabled;
var customDataEnabled;
var colorsEnabled;
var watcherBlur;
var textSaveMode = "keyup";

/*
INITIALIZE SAVE DATA
 */
var annotationSaveData = {};

/*
AGILE BOARD COMBOBOXES / NOTE FIELDS
 */

function save() {
	if (cleanupEnabled === true) {
		cleanUpLocalStorage();
	}
	saveStash();
	saveSaveables();
}

function saveStash() {
	var elements = document.getElementsByClassName(STASH_NOTE_CLASSNAME);
	for (var i = 0; i < elements.length; ++i) {
		saveAnnotation(elements[i].getAttribute("id"), elements[i].value);
	}
}

function saveSaveables() {
	var elements = document.getElementsByClassName(SAVEABLE_CLASSNAME);
	for (var i = 0; i < elements.length; ++i) {
		saveAnnotation(elements[i].getAttribute("id"), elements[i].value);
	}
}

function createSelectNode(currId, array) {
	var select = document.createElement("select");
	select.setAttribute("id", currId + CUSTOM_SELECT_ID + array);
	select.setAttribute("arrayNumber", array);
	select.setAttribute("class", SAVEABLE_CLASSNAME + " " + CLASS_DROPDOWN);
	for (var j = 0; j < values[array].length; j++) {
		var option = document.createElement('option');
		option.text = values[array][j];
		select.add(option, j);
	}
	select.value = loadAnnotation(select.getAttribute("id"));
	//applyColorMappings(select, array);
	select.addEventListener("click", function () {
		selectNodeClickHandler(event);
	});
	return select;
}

function selectNodeClickHandler(event) {
	var array = event.target.getAttribute("arrayNumber");
	applyColorMappings(event.target, array);
	save();
}

function createInputNode(currId) {
	var input = document.createElement("input");
	input.setAttribute("id", currId + CUSTOM_INPUT_ID);
	input.setAttribute("class", SAVEABLE_CLASSNAME);
	var inputValue = loadAnnotation(input.getAttribute("id"));
	if (inputValue != null) {
		input.value = inputValue;
	}
	input.addEventListener(textSaveMode, save);
	return input;
}

function addComponents() {
	if (isBugScreen()) {
		var currId = document.getElementById("key-val").getAttribute("data-issue-key");
		document.getElementsByClassName("aui-nav-breadcrumbs")[0].appendChild(createCopyPasteButton());
		if (stashEnabled === true) {
			document.getElementsByClassName("aui-nav-breadcrumbs")[0].appendChild(createStashButton(getLocationInStash(currId) != -1));
		}
		for (var counter = 0; counter < values.length; counter++) {
			var node = createSelectNode(currId, counter);
			document.getElementsByClassName("aui-nav-breadcrumbs")[0].appendChild(node);
			applyColorMappings(node, counter);
		}
		if (notesEnabled === true) {
			document.getElementsByClassName("aui-nav-breadcrumbs")[0].appendChild(createInputNode(currId));
		}
		document.getElementById("viewissuesidebar").appendChild(createNotePadComponent(currId));
		formatBrowse(currId);
	} else if (isRapidBoardScreen()) {
		var elements = document.getElementsByClassName("ghx-issue-compact");
		for (var i = 0; i < elements.length; i++) {
			var curr = elements[i];
			var rightEdge = curr.childNodes[0].childNodes[1];
			currId = curr.getAttribute("data-issue-key");
			if (notesEnabled === true) {
				rightEdge.insertBefore(createInputNode(currId), rightEdge.childNodes[0]);
			}
			for (var counter = 0; counter < values.length; counter++) {
				var node = createSelectNode(currId, counter);
				rightEdge.insertBefore(createSelectNode(currId, counter), rightEdge.childNodes[counter]);
				applyColorMappings(node, counter);
			}
			var startRow = curr.childNodes[0].childNodes[0];
			startRow.insertBefore(createCopyPasteButtonForAgileBoard(currId), curr.childNodes[0].childNodes[0].childNodes[0]);

		}
	} else if (isTempoScreen()) {
		document.getElementById("tempo-report-header-div").appendChild(getLoadLogFileButton());
	}
}

function formatBrowse(currId) {
	formatNotePad(currId);
}

function formatNotePad(currId) {
	var notePad = document.getElementById(getNotePadId(currId));
	if (notePad.value != '') {
		var height = notePad.scrollHeight / 15;
		var heightUpperbound = 35;
		if (height > heightUpperbound) {
			height = heightUpperbound;
		}
		notePad.rows = (height);
	}
}

/*
CREATE BUG STASH
 */

function createStashComponent() {
	if (isRapidBoardScreen()) {
		var storedStash = loadAnnotation("CustomIssueStash");
		if (storedStash == null) {
			var emptyArray = JSON.stringify([]);
			saveAnnotation("CustomIssueStash", emptyArray);
			storedStash = emptyArray;

		}
		var issues = JSON.parse(storedStash);

		if (issues != null && issues[0] != null) {
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

			for (var i = 0; i < issues.length; ++i) {
				issueList.appendChild(createIssueRow(issues[i]));
			}
			container.appendChild(issueList);

			var contentGroup = document.getElementById("ghx-content-group");
			contentGroup.insertBefore(container, contentGroup.childNodes[0]);
		}
	}
}

function createIssueRow(issues) {
	var issueKey = issues[0];
	var issueVal = issues[1];
	var div = document.createElement("div");
	div.setAttribute("class", "ghx-issue-compact ghx-type-52");
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
	input.setAttribute("id", STASH_NOTE_CLASSNAME + issueKey);
	input.setAttribute("class", STASH_NOTE_CLASSNAME);
	var inputValue = loadAnnotation(input.getAttribute("id"));
	if (inputValue != null) {
		input.value = inputValue;
	}
	input.addEventListener(textSaveMode, save);
	input.size = 100;
	endRowInner.appendChild(input);
	endRow.appendChild(endRowInner);
	var removeBtn = document.createElement("button");
	removeBtn.setAttribute("key", issueKey);
	removeBtn.textContent = "x";
	removeBtn.addEventListener("click", function () {
		removeElementFromStash(event.target.getAttribute("key"));
		event.target.parentNode.parentNode.parentNode.remove();
	});
	endRow.appendChild(removeBtn);

	issueContent.appendChild(row);
	issueContent.appendChild(endRow);
	div.appendChild(issueContent);
	return div
}

function removeElementFromStash(key) {
	var issues = JSON.parse(loadAnnotation("CustomIssueStash"));
	if (issues == null) {
		issues = [];
	}
	var loc = getLocationInStash(key);
	if (loc > -1) {
		issues.splice(loc, 1);
	}
	saveAnnotation("CustomIssueStash", JSON.stringify(issues));
}

function createStashButton(inStash = false) {
	var btn = document.createElement("BUTTON");
	btn.setAttribute("id", "stashButton");
	var label = "stash";
	if (inStash === true) {
		label = "destash";
	}
	var text = document.createTextNode(label);
	btn.appendChild(text);
	btn.addEventListener("click", stashButtonListener);
	return btn;
}

function stashButtonListener() {
	var key = document.getElementById("key-val").getAttribute("data-issue-key");
	var label = document.getElementById("summary-val").textContent;
	var issues = JSON.parse(loadAnnotation("CustomIssueStash"));
	if (issues == null) {
		issues = [];
	}
	var loc = getLocationInStash(key);
	if (loc > -1) {
		issues.splice(loc, 1);
	} else {
		issues.push([key, label]);
	}
	saveAnnotation("CustomIssueStash", JSON.stringify(issues));
	toggleButton();
}

function toggleButton() {
	var buttonText = document.getElementById('stashButton').childNodes[0].textContent;
	if (buttonText == "stash") {
		document.getElementById("stashButton").childNodes[0].textContent = 'destash';
	} else {
		document.getElementById("stashButton").childNodes[0].textContent = 'stash';
	}
}

function getLocationInStash(key) {
	var issues = JSON.parse(loadAnnotation("CustomIssueStash"));
	if (issues == null) {
		saveAnnotation("CustomIssueStash", JSON.stringify([]))
		issues = [];
	}
	var location = -1;
	for (var it = 0; it < issues.length; ++it) {
		var curr = issues[it];
		if (curr != null) {
			if (curr[0] === key) {
				location = it;
				break;
			}
		}
	}
	return location;
}

/*
TO DO LIST
 */

function createToDoListComponent() {
	if (isRapidBoardScreen()) {
		var storedTodos = loadAnnotation("CustomTodoStash");
		if (storedTodos == null) {
			var emptyArray = JSON.stringify([]);
			saveAnnotation("CustomTodoStash", emptyArray);
			storedTodos = emptyArray;
		}
		var todos = JSON.parse(storedTodos);

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
		containerLabel.textContent = "To do";

		var issueListContainer = document.createElement("div");
		issueListContainer.setAttribute("class", "ghx-meta ghx-disabled");

		expander.appendChild(expanderIcon);
		header.appendChild(expander);
		nameDiv.appendChild(containerLabel);
		header.appendChild(nameDiv);
		container.appendChild(header);

		var todoList = document.createElement("div");
		todoList.setAttribute("id", "todoListDiv")
		todoList.setAttribute("class", "ghx-issues js-issue-list ghx-has-issues");
		if (todos != null) {
			for (var i = 0; i < todos.length; ++i) {
				todoList.appendChild(createTodoRow(todos[i]));
			}
		}
		todoList.appendChild(createAddTodo());
		container.appendChild(todoList);

		var contentGroup = document.getElementById("ghx-content-group");
		contentGroup.insertBefore(container, contentGroup.childNodes[0]);
	}
}

function createTodoRow(value) {
	var div = document.createElement("div");
	div.setAttribute("class", "ghx-issue-compact ghx-type-52");

	var issueContent = document.createElement("div");
	issueContent.setAttribute("class", "ghx-issue-content");

	var row = document.createElement("div");
	row.setAttribute("class", "ghx-row");

	var todos = JSON.parse(loadAnnotation("CustomTodoStash"));

	var summary = document.createElement("div");
	summary.setAttribute("class", "ghx-summary");
	var summaryInner = document.createElement("span");
	summaryInner.setAttribute("class", "ghx-inner");
	summaryInner.textContent = value;
	summary.appendChild(summaryInner);
	row.appendChild(summary);

	issueContent.appendChild(row);

	var doneBtn = document.createElement("button");
	doneBtn.textContent = "Done";
	doneBtn.addEventListener("click", function (event) {
		var id = getNodeIndex(event.target.parentElement.parentElement.parentElement.parentElement);
		var todos = JSON.parse(loadAnnotation("CustomTodoStash"));
		todos.splice(id, 1);
		event.target.parentElement.parentElement.parentElement.remove();
		saveAnnotation("CustomTodoStash", JSON.stringify(todos));
	});

	var endRow = document.createElement("div");
	endRow.setAttribute("class", "ghx-end ghx-row");
	var endRowInner = document.createElement("span");
	endRowInner.setAttribute("class", "ghx-end");
	endRowInner.appendChild(doneBtn);
	endRow.appendChild(endRowInner);

	issueContent.appendChild(endRow)
	div.appendChild(issueContent);
	return div
}

function createAddTodo() {
	var div = document.createElement("div");
	div.setAttribute("class", "js-issue ghx-issue-compact ghx-type-52");

	var issueContent = document.createElement("div");
	issueContent.setAttribute("class", "ghx-issue-content");

	var row = document.createElement("div");
	row.setAttribute("class", "ghx-row");

	var input = document.createElement("input");
	input.setAttribute("id", "todoInput");
	input.size = 150;
	row.appendChild(input);

	var button = document.createElement("button");
	button.textContent = "Add";
	button.addEventListener("click", function () {
		var todos = JSON.parse(loadAnnotation("CustomTodoStash"));
		var number = todos.length;
		var val = document.getElementById("todoInput").value;
		todos.push(val);
		var listDiv = document.getElementById("todoListDiv");
		listDiv.insertBefore(createTodoRow(val), listDiv.childNodes[listDiv.childNodes.length - 1]);
		saveAnnotation("CustomTodoStash", JSON.stringify(todos));
		document.getElementById("todoInput").value = "";

	});
	row.appendChild(button);

	issueContent.appendChild(row);
	//issueContent.appendChild(endRow);
	div.appendChild(issueContent);
	return div
}

function getNodeIndex(child) {
	var i = 0;
	while ((child = child.previousSibling) != null)
		i++;
	return i;
}

/*
COPY BUTTON
 */

function createCopyPasteButton() {
	var btn = document.createElement("button");
	btn.setAttribute("id", "copyButton");
	var label = "copy";
	var text = document.createTextNode(label);
	btn.appendChild(text);
	btn.addEventListener("click", function () {
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
		setTimeout(function () {
			document.getElementById("copyButton").childNodes[0].textContent = 'copy';
		}, 1000);
	});
	return btn;
}

function createCopyPasteButtonForAgileBoard(currId) {
	var btn = document.createElement("button");
	btn.setAttribute("id", "copyButton" + currId);
	var label = "c";
	var text = document.createTextNode(label);
	btn.appendChild(text);
	btn.addEventListener("click", function (event) {
		var copyFrom = document.createElement("textarea");
		var key = event.target.getAttribute("id").replace("copyButton", '');
		var label = "";
		label = event.target.parentNode.childNodes[4].textContent
			copyFrom.textContent = key + " - " + label;
		var body = document.getElementsByTagName('body')[0];
		body.appendChild(copyFrom);
		copyFrom.select();
		document.execCommand('copy');
		body.removeChild(copyFrom);
		event.target.childNodes[0].textContent = 'copied!';
		setTimeout(function () {
			event.target.childNodes[0].textContent = 'c';
		}, 1000);
	});
	return btn;
}

/*
NOTEPAD COMPONENT
 */

function createNotePadComponent(currId) {
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
	//Add components
	var notePad = createNotePad(currId);
	var saveButton = createNotePadSaveButton(currId);
	var dateButton = createAppendDateButton(currId);
	//Add components end
	ul.appendChild(notePad);
	ul.appendChild(saveButton);
	ul.appendChild(dateButton);
	header.appendChild(label);
	toggleWrap.appendChild(header);
	contentDiv.appendChild(ul);
	toggleWrap.appendChild(contentDiv);
	return toggleWrap;
}

function createNotePad(currId) {
	var notePad = document.createElement("textarea");
	notePad.setAttribute("class", SAVEABLE_CLASSNAME);
	notePad.setAttribute("id", getNotePadId(currId));
	var content = loadAnnotation(notePad.getAttribute("id"));
	if (content != null) {
		notePad.value = content;
	}
	notePad.rows = 10;
	notePad.cols = 70;
	notePad.addEventListener(textSaveMode, save);
	return notePad;
}

function createNotePadSaveButton(currId) {
	var btn = document.createElement("button");
	btn.setAttribute("id", currId);
	btn.textContent = 'download';
	//TODO: look into FSO to save to a configurable folder on disk, which would then save to $FOLDER/$SPRINT_NUMBER/$TICKET_ID.
	btn.addEventListener("click", function (event) {
		var textToWrite = addAdditionalData() + document.getElementById(getNotePadId(event.target.getAttribute("id"))).value;
		var textFileAsBlob = new Blob([textToWrite], {
				type : 'text/plain'
			});
		var sprint = document.getElementsByClassName("issueaction-greenhopper-rapidboard-operation js-rapidboard-operation-sprint")[0];
		if (sprint == null) {
			sprint = "Undefined Sprint";
		} else {
			sprint = sprint.textContent;
		}
		var fileNameToSaveAs = NOTENAME_PREFIX + sprint + NOTENAME_SEPARATOR + event.target.getAttribute("id") + " - " + document.getElementById("summary-val").textContent;

		var downloadLink = document.createElement("a");
		downloadLink.download = fileNameToSaveAs;
		downloadLink.innerHTML = "Hidden Link";

		window.URL = window.URL || window.webkitURL;
		downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);

		downloadLink.click();
		document.body.removeChild(downloadLink);
	});
	return btn;
}

function addAdditionalData() {
	var result = "";
	if (customDataEnabled) {
		downloadMetadataCheckboxes;
		result += "["
		var elems = document.getElementsByClassName(CLASS_DROPDOWN);
		for (var i = 0; i < downloadMetadataCheckboxes.length; ++i) {
			var idNumber = downloadMetadataCheckboxes[i];
			result += NOTENAME_SEPARATOR;
			result += elems[idNumber].value;
		}
		result = result + "__]\n";
	}
	return result;
}

function createAppendDateButton(currId) {
	var btn = document.createElement("button");
	btn.setAttribute("id", "addDate" + currId);
	btn.textContent = "Append Date";
	btn.addEventListener("click", function (event) {
		var id = event.target.getAttribute("id");
		id = id.replace("addDate", '');
		var notePad = document.getElementById(getNotePadId(currId));
		notePad.value = notePad.value.concat(getDateBlock());
	});
	return btn;
}

function getNotePadId(id) {
	return (id + NOTEPAD_ID);
}

function getDateBlock() {
	var date = new Date();
	var monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
	var dateString = "| " + date.getDate() + " " + monthNames[date.getMonth()] + " " + date.getFullYear() + " |";
	var length = dateString.length;
	var bar = "\n+";
	for (var i = 1; i < dateString.length - 1; ++i) {
		bar = bar.concat("-");
	}
	bar = bar.concat("+\n");
	return bar + dateString + bar;
}

/*
LOCALSTORAGE CLEAN UP
 */

function cleanUpLocalStorage() {
	if (isRapidBoardScreen()) {
		var annotationSaveData = JSON.parse(localStorage.getItem(ANNOTATION_SAVE_DATA));
		for (var key in annotationSaveData) {
			if (key.indexOf('customInput') != -1 || key.indexOf('customSelect') != -1 || key.indexOf('stashNote') != -1) {
				delete annotationSaveData[key];
			}
		}
		localStorage.setItem(ANNOTATION_SAVE_DATA, JSON.stringify(annotationSaveData));
	}
}

/*
REMOVE DETAIL VIEW
 */

function removeDetailView() {

	if (isRapidBoardScreen()) {
		document.getElementById("ghx-detail-view").remove();
	}
}

/*
SAVE AND LOAD DATA
 */

function saveAnnotation(key, value) {
	var annotationSaveData = JSON.parse(localStorage.getItem(ANNOTATION_SAVE_DATA));
	annotationSaveData[key] = value;
	localStorage.setItem(ANNOTATION_SAVE_DATA, JSON.stringify(annotationSaveData));
}

function loadAnnotation(key) {
	var annotationSaveData = JSON.parse(localStorage.getItem(ANNOTATION_SAVE_DATA));
	var retVal;
	retVal = annotationSaveData[key];
	return retVal;
}

/*
APPLY COLOR MAPPINGS
 */

function applyColorMappings(element, array) {
	element = document.getElementById(element.id);
	if (colorsEnabled === true) {
		var map = JSON.parse(dropDownMappings[array]);
		if (element.value != null && map[element.value] != null) {
			/*
			var background = element.style.backgroundColor;
			var row = element.parentNode.parentNode.style.backgroundColor;
			var text = element.parentNode.parentNode.style.color;
			 */
			var background = DEFAULT_DROPDOWN_COLOR;
			var row = DEFAULT_ROW_COLOR;
			var text = DEFAULT_FONT_COLOR;
			var mappingArray = map[element.value].split(";");
			for (var i = 0; i < mappingArray.length; ++i) {
				var mapping = mappingArray[i];
				var splitMapping = mapping.split(":");

				if (splitMapping.length == 2) {
					var component = splitMapping[0];
					var value = splitMapping[1];
					if (component === "dropdown") {
						background = value;
					} else if (component === "row") {
						var id = element.id;
						row = value;
					} else if (component === "text") {
						var id = element.id;
						text = value;
					}
				} else {
					background = splitMapping[0];
				}
			}
			element.style.backgroundColor = background;
			element.parentNode.parentNode.style.backgroundColor = row;
			element.parentNode.parentNode.style.color = text;
		}
	}
}

/*
REMOVE BLUR FOR WATCHER LIST
 */
function removeBlurFromWatcherList() {
	if (isBugScreen()) {
		document.getElementById("view-watcher-list").addEventListener("click", function () {
			setTimeout(function () {
				document.getElementById("inline-dialog-watchers").style.cssText = document.getElementById("inline-dialog-watchers").style.cssText.replace(" translateZ(0px)", "");
			}, 100);
		});
	}
}

/*
UTILITY FUNCTIONS TO DETERMINE SCREEN
 */
function isRapidBoardScreen() {
	var location = window.location.href;
	return (location.indexOf("RapidBoard.jspa") != -1);
}

function isBugScreen() {
	var location = window.location.href;
	return (location.indexOf("browse") != -1);
}

function isTempoScreen() {
	var location = window.location.href;
	return (location.indexOf("TempoUserBoard") != -1);
}

/*
DRIVER FUNCTION
 */
function triggerCustomization() {

	if (jiraLocation != null && jiraLocation != '' && window.location.href.indexOf(jiraLocation) != -1) {

		var jsonifiedSaveData = localStorage.getItem(ANNOTATION_SAVE_DATA);
		if (jsonifiedSaveData != null) {
			annotationSaveData = JSON.parse(jsonifiedSaveData);
		} else {
			localStorage.setItem(ANNOTATION_SAVE_DATA, "{}");
		}

		addComponents();
		if (stashEnabled === true) {
			createStashComponent();
		}
		createToDoListComponent();
		if (detailDisabled === true) {
			removeDetailView();
		}
		if (watcherBlur === true) {
			removeBlurFromWatcherList();
		}
	}
}

/*
TEMPO LOAD LOG FILE
 */
function getLoadLogFileButton() {
	var btn = document.createElement("button");
	btn.textContent = "Load log JSON";
	btn.addEventListener("click", loadLogFile);
	return btn;
}

var monthNames = [
	"Jan", "Feb", "Mar",
	"Apr", "May", "Jun", "Jul",
	"Aug", "Sep", "Oct",
	"Nov", "Dec"
];
var pathBase = jiraLocation + "/rest/tempo-rest/1.0/worklogs/";

function getConstantParameters() {
	var params = {};
	var date = new Date();
	var month = date.getMonth() + 1;
	var today = date.getFullYear() + "-" + (month < 10 ? "0" + month : month) + "-" + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate());
	params["user"] = getMetaContentByName("ajs-remote-user");
	params["id"] = ""
		params["type"] = ""
		params["use-ISO8061-week-numbers"] = "false"
		params["ansidate"] = "";
	params["ansienddate"] = today;
	params["selected-panel"] = 0
		params["analytics-origin-page"] = "TempoUserBoard"
		params["analytics-origin-view"] = "timesheet"
		params["analytics-origin-action"] = "click-log-work-button"
		params["startTimeEnabled"] = "false"
		params["tracker"] = "false"
		params["planning"] = "false"
		params["issue"] = "";
	params["date"] = "";
	params["enddate"] = "";
	params["time"] = "";
	params["billedTime"] = "";
	params["comment"] = "";
	params["_Role_"] = "";
	return params;
}

function postCurrentBug(params, currentBug) {
	var ansiDate = new Date(currentBug["date"]);
	var todayDate = new Date();
	var ansiMonth = ansiDate.getMonth() + 1;

	params["issue"] = currentBug["bugNumber"];
	params["date"] = currentBug["date"];
	params["ansidate"] = ansiDate.getFullYear() + "-" + (ansiMonth < 10 ? "0" + ansiMonth : ansiMonth) + "-" + (ansiDate.getDate() < 10 ? "0" + ansiDate.getDate() : ansiDate.getDate());
	params["enddate"] = (todayDate.getDate() < 10 ? "0" + todayDate.getDate() : todayDate.getDate()) + "/" + monthNames[todayDate.getMonth()] + "/" + todayDate.getFullYear().toString().substr(2, 2); // 09/Jun/16 // today? looks like today (so new Date() and then format)
	params["time"] = currentBug["worked"];
	params["billedTime"] = currentBug["billed"];

	params["comment"] = currentBug["description"];
	params["_Role_"] = currentBug["Role"];
	var path = pathBase + currentBug["bugNumber"];
	ajaxPost(path, params);
}

function ajaxPost(path, params) {

	var ajax = {};
	ajax.x = function () {
		if (typeof XMLHttpRequest !== 'undefined') {
			return new XMLHttpRequest();
		}
		var versions = [
			"MSXML2.XmlHttp.6.0",
			"MSXML2.XmlHttp.5.0",
			"MSXML2.XmlHttp.4.0",
			"MSXML2.XmlHttp.3.0",
			"MSXML2.XmlHttp.2.0",
			"Microsoft.XmlHttp"
		];

		var xhr;
		for (var i = 0; i < versions.length; i++) {
			try {
				xhr = new ActiveXObject(versions[i]);
				break;
			} catch (e) {}
		}
		return xhr;
	};

	ajax.send = function (url, callback, method, data, async) {
		if (async === undefined) {
			async = true;
		}
		var x = ajax.x();
		x.open(method, url, async);
		x.onreadystatechange = function () {
			if (x.readyState == 4) {
				callback(x.responseText)
			}
		};
		if (method == 'POST') {
			x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		}
		x.send(data)
	};

	ajax.post = function (url, data, callback, async) {
		var query = [];
		for (var key in data) {
			query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
		}
		ajax.send(url, callback, 'POST', query.join('&'), async)
	};
	ajax.post(path, params, function () {});
}

function getMetaContentByName(name, content) {
	var content = (content == null) ? 'content' : content;
	return document.querySelector("meta[name='" + name + "']").getAttribute(content);
}

function loadLogFile() {
	var logFileContent = document.getElementById("LogFileContent");
	if (logFileContent != null) {
		if (LogFileContent.value != "") {
			var bugString = LogFileContent.value;
			if (bugString != null && bugString != "") {
				var bugs = JSON.parse(bugString);
				var constants = getConstantParameters();
				for (var i = 0; i < bugs.length; ++i) {
					postCurrentBug(constants, bugs[i]);
				}
			}
			location.reload();
		}
	} else {
		var textArea = document.createElement("textarea");
		textArea.setAttribute("id", "LogFileContent");
		document.getElementById("tempo-report-header-div").appendChild(textArea);
	}
}

/*
DEFINE VARIABLES AND EXECUTE
 */

chrome.runtime.sendMessage({
	method : "getLocalStorage",
	key : CONFIG_SAVE_DATA
}, function (response) {
	configurationData = JSON.parse(response.data);
	triggerDelay = configurationData["triggerDelay"];

	// -- BEGIN VARIABLES --

	jiraLocation = configurationData[CONFIG_JIRA_LOCATION];
	values = JSON.parse(configurationData[CONFIG_DROP_DOWN_VALUES]);
	downloadMetadataCheckboxes = JSON.parse(configurationData[CONFIG_ENABLED_METADATA_BOXES]);
	stashEnabled = configurationData[CONFIG_STASH_ENABLED];
	notesEnabled = configurationData[CONFIG_NOTES_ENABLED];
	cleanupEnabled = configurationData[CONFIG_CLEANUP_ENABLED];
	detailDisabled = configurationData[CONFIG_DETAILS_PANEL_DISABLED];
	colorsEnabled = configurationData[CONFIG_DD_COLORS_ENABLED];
	customDataEnabled = configurationData[CONFIG_CUSTOM_DATA_NOTES];
	textSaveMode = configurationData[CONFIG_TEXT_SAVE_MODE];
	dropDownMappings = JSON.parse(configurationData[CONFIG_DROP_DOWN_MAPPINGS]);
	watcherBlur = JSON.parse(configurationData[CONFIG_WATCHER_BLUR]);

	// -- END VARIABLES --

	// Trigger customizations
	setTimeout(triggerCustomization, triggerDelay);
});
