const CONFIG_SAVE_DATA = "configurationData";
const ENTRY_CONFIG_DELIMITER = '[';


var saveData = {};
document.getElementById("backendSave").addEventListener("click", save);
document.getElementById("addTextField").addEventListener("click", addDropDown);
document.getElementById("stashEnabled").addEventListener("click", save);
document.getElementById("notesEnabled").addEventListener("click", save);
document.getElementById("cleanupEnabled").addEventListener("click", save);
document.getElementById("detailDisabled").addEventListener("click", save);
document.getElementById("colorsEnabled").addEventListener("click", save);
document.getElementById("watcherBlur").addEventListener("click", save);
document.getElementById("enableDropDownNames").addEventListener("click", save);
document.getElementById("textSaveMode").addEventListener("click", save);
document.getElementById("customDataEnabled").addEventListener("click", saveAndReload);
document.getElementById("jiraLocation").addEventListener("keyup", save);
document.getElementById("backendLocation").addEventListener("keyup", save);
document.getElementById("triggerDelay").addEventListener("keyup", save);

/*
DESPARATELY NEED A CLEANUP - COPIED FROM MAIN CODE
*/


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

function ajaxGet(path, params) {

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
		return x.responseText;
	};
	ajax.get = function (url, data, callback, async) {
		var query = [];
		for (var key in data) {
			query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
		}
		return ajax.send(url + (query.length ? '?' + query.join('&') : ''), callback, 'GET', null, async)
	};
	var result =
	ajax.get(path, params, function (r) {return r}, false);
	return result;
}


/*
INITIAL LOAD -- SET DEFAULT VALUES
 */
if (localStorage.getItem("initialized") != 'true') {
	var initialArray = [["", "To do", "To Investigate", "To Test", "Waiting for answer", "Needs BA/discussion", "WIP", "Awaiting code review", "To Redo/fix", "Ready for check-in", "Checked in", "Done"]];
	saveData = {
		"dropDownArraysConfig" : JSON.stringify(initialArray),
		"dropDownNames" : "[]",
		"dropDownMappings" : "[]",
		"enabledBoxesConfig" : "[]",
		"notesConfig" : true,
		"cleanupConfig" : true,
		"stashConfig" : true,
		"textSaveMode" : "keyup",
		"backendSave" : "",
		"triggerDelay" : "750"
	};
	localStorage.setItem(CONFIG_SAVE_DATA, JSON.stringify(saveData));

	localStorage.setItem("initialized", true);
}

var counter = 0;
loadConfig();
function addDropDown() {
	var div = document.createElement("div");

	var newText = document.createElement("textArea");
	newText.setAttribute("id", "dropDownField" + counter);
	newText.setAttribute("class", "dropDowns");
	newText.style.height = "100px";
	newText.addEventListener("keyup", save);
	linebreak = document.createElement("br");
	var includeInMetadata = document.createTextNode("Include in note downloads? ");
	var checkbox = document.createElement("input")
		checkbox.type = "checkbox";
	checkbox.id = "checkbox" + counter;
	checkbox.setAttribute("class", "dropDownMetadataCheckbox");
	checkbox.addEventListener("click", save);

	var ddName = document.createElement("input");
	ddName.setAttribute("id", "dropDownName" + counter);
	ddName.setAttribute("class", "dropDownName");
	ddName.addEventListener("keyup", save);
	ddName.value = "Drop Down " + counter;
	div.appendChild(newText);
	div.appendChild(ddName);

	if (document.getElementById("customDataEnabled").checked) {
		div.appendChild(linebreak);
		div.appendChild(includeInMetadata);
		div.appendChild(checkbox);
	}

	var container = document.getElementById("container");
	container.appendChild(div);
	counter += 1;
	return newText;
}

function save() {
	var jiraLocation = document.getElementById("jiraLocation").value;
	var backendLocation = document.getElementById("backendLocation").value;
	var triggerDelay = document.getElementById("triggerDelay").value;
	var notesEnabled = document.getElementById("notesEnabled").checked;
	var stashEnabled = document.getElementById("stashEnabled").checked;
	var cleanupEnabled = document.getElementById("cleanupEnabled").checked;
	var detailDisabled = document.getElementById("detailDisabled").checked;
	var customDataEnabled = document.getElementById("customDataEnabled").checked;
	var colorsEnabled = document.getElementById("colorsEnabled").checked;
	var watcherBlur = document.getElementById("watcherBlur").checked;
	var enableDropDownNames = document.getElementById("enableDropDownNames").checked;
	var dropDowns = document.getElementsByClassName("dropDowns");
	var dropDownNewNames = document.getElementsByClassName("dropDownName");
	var textSaveMode = document.getElementById("textSaveMode").value;
	var backendSave = document.getElementById("backendSave").checked;
	var dropDownsValues = [];
	var dropDownNames = [];
	var colorMappings = {};
	for (var i = 0; i < dropDowns.length; ++i) {
		var textValue = dropDowns[i].value;
		if (textValue != '') {
			var split = textValue.split("\n");
			var values = [];
			var mappings = {};
			
			for (var j=0;j<split.length;++j){
				var line = split[j];
				var splitLine = line.split(ENTRY_CONFIG_DELIMITER);
				if (splitLine.length == 2){
					var option = splitLine[0];
					var config = splitLine[1];
					if (config.charAt(config.length -1) === "]"){
						config = config.substring(0, config.length -1);
					}
					mappings[option] = config;
					values.push(option);
				} else {
					values.push(line);
				}
			}
			colorMappings[i] = JSON.stringify(mappings);
			dropDownsValues.push(values);
			dropDownNames.push(dropDownNewNames[i].value);
		}
	}
	
	var checkboxes = document.getElementsByClassName("dropDownMetadataCheckbox");
	var enabledBoxes = [];
	//TODO: FIX THIS, else the enabled boxes will be set back to empty every time they are disabled
	if (customDataEnabled != null) {
		for (var i = 0; i < checkboxes.length; ++i) {
			var checked = checkboxes[i].checked;
			if (checked) {
				enabledBoxes.push(i);
			}
		}
	} 
	saveData = {
		"jiraLocationConfig" : jiraLocation,
		"backendLocation" : backendLocation,
		"triggerDelay" : triggerDelay,
		"dropDownArraysConfig" : JSON.stringify(dropDownsValues),
		"dropDownMappings" : JSON.stringify(colorMappings),
		"dropDownNames" : JSON.stringify(dropDownNames),
		"enabledBoxesConfig" : JSON.stringify(enabledBoxes),
		"notesConfig" : notesEnabled,
		"cleanupConfig" : cleanupEnabled,
		"detailConfig" : detailDisabled,
		"customDataConfig" : customDataEnabled,
		"colorsEnabled" : colorsEnabled,
		"watcherBlur" : watcherBlur,
		"enableDropDownNames" : enableDropDownNames,
		"stashConfig" : stashEnabled,
		"textSaveMode" : textSaveMode,
		"backendSave" : backendSave
	};
	var val = JSON.stringify(saveData);
	localStorage.setItem(CONFIG_SAVE_DATA, val);
	if (backendSave===true) {
		var stringifiedVal = JSON.stringify(val);
		ajaxPost(backendLocation + "/persist/settings", {"key" : CONFIG_SAVE_DATA, "value" : stringifiedVal.substring(1, stringifiedVal.length-1)});
	}
}


function saveAndReload() {
	save();
	location.reload();
}

function loadConfig() {
	var data = JSON.parse(localStorage.getItem(CONFIG_SAVE_DATA));
	if (data["backendSave"] != null && data["backendSave"] !== "") {
		var backendSave = JSON.parse(data["backendSave"]);
		var backendLocation = data["backendLocation"];
		if (backendSave) {
			var backendSideString = ajaxGet(backendLocation + "/persist/settings");
			if (backendSideString !== null && backendSideString !== ""){
				var backendSide = JSON.parse(backendSideString);
				if (backendSide !== null && backendSide !== "") {
					data = backendSide;
				}
			}
		}
	}
	var jiraLocation = data["jiraLocationConfig"];
	var textSaveMode = data["textSaveMode"];
	var triggerDelay = data["triggerDelay"];
	var notes = data["notesConfig"];
	var stash = data["stashConfig"];
	var cleanup = data["cleanupConfig"];
	var detail = data["detailConfig"];
	var colorsEnabled = data["colorsEnabled"];
	var watcherBlur = data["watcherBlur"];
	var enableDropDownNames = data["enableDropDownNames"];
	var customData = data["customDataConfig"];
	var dropDowns = JSON.parse(data["dropDownArraysConfig"]);
	var dropDownNames = JSON.parse(data["dropDownNames"]);
	var mappings = JSON.parse(data["dropDownMappings"]);
	var enabledBoxes = JSON.parse(data["enabledBoxesConfig"]);

	document.getElementById("jiraLocation").value = jiraLocation;
	document.getElementById("backendLocation").value = backendLocation;
	document.getElementById("triggerDelay").value = triggerDelay;
	document.getElementById("textSaveMode").value = textSaveMode;
	if (notes === true) {
		document.getElementById("notesEnabled").checked = true;
	}
	if (stash === true) {
		document.getElementById("stashEnabled").checked = true;
	}
	if (cleanup === true) {
		document.getElementById("cleanupEnabled").checked = true;
	}
	if (detail === true) {
		document.getElementById("detailDisabled").checked = true;
	}
	if (colorsEnabled === true) {
		document.getElementById("colorsEnabled").checked = true;
	}
	if (enableDropDownNames === true) {
		document.getElementById("enableDropDownNames").checked = true;
	}
	if (watcherBlur === true) {
		document.getElementById("watcherBlur").checked = true;
	}
	if (customData === true) {
		document.getElementById("customDataEnabled").checked = true;
	}
	if (backendSave === true) {
		document.getElementById("backendSave").checked = true;
	}
	if (dropDowns != null) {
		for (var i = 0; i < dropDowns.length; ++i) {
			var newTextArea = addDropDown();
			var content = dropDowns[i].toString();
			var map = {};
			if (mappings[i] !== null && mappings[i] !== undefined) {
				var map = JSON.parse(mappings[i]);
			}
			var splitContent = content.split(',');
			for (var j=0;j<splitContent.length; ++j){
				if (map.hasOwnProperty(splitContent[j])){
					
					splitContent[j] = splitContent[j] + "[" + map[splitContent[j]] + "]";
				}
			}
			content = splitContent.join('\n');
			newTextArea.value = content;
			document.getElementById("dropDownName" + i).value = dropDownNames[i];
		}
	}
	if (enabledBoxes != null) {
		for (var i = 0; i < enabledBoxes.length; ++i) {
			document.getElementById("checkbox" + enabledBoxes[i]).checked = true;
			newTextArea.value = content;
		}
	}
}