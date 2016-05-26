const CONFIG_SAVE_DATA = "configurationData";
const ENTRY_CONFIG_DELIMITER = '[';


var saveData = {};
document.getElementById("addTextField").addEventListener("click", addDropDown);
document.getElementById("stashEnabled").addEventListener("click", save);
document.getElementById("notesEnabled").addEventListener("click", save);
document.getElementById("cleanupEnabled").addEventListener("click", save);
document.getElementById("detailDisabled").addEventListener("click", save);
document.getElementById("colorsEnabled").addEventListener("click", save);
document.getElementById("textSaveMode").addEventListener("click", save);
document.getElementById("customDataEnabled").addEventListener("click", saveAndReload);
document.getElementById("jiraLocation").addEventListener("keyup", save);
document.getElementById("triggerDelay").addEventListener("keyup", save);

/*
INITIAL LOAD -- SET DEFAULT VALUES
 */
if (localStorage.getItem("initialized") != 'true') {
	var initialArray = [["", "To do", "To Investigate", "To Test", "Waiting for answer", "Needs BA/discussion", "WIP", "Awaiting code review", "To Redo/fix", "Ready for check-in", "Checked in", "Done"]];
	saveData = {
		"dropDownArraysConfig" : JSON.stringify(initialArray),
		"notesConfig" : true,
		"cleanupConfig" : true,
		"stashConfig" : true,
		"textSaveMode" : "keyup",
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

	div.appendChild(newText);

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
	var triggerDelay = document.getElementById("triggerDelay").value;
	var notesEnabled = document.getElementById("notesEnabled").checked;
	var stashEnabled = document.getElementById("stashEnabled").checked;
	var cleanupEnabled = document.getElementById("cleanupEnabled").checked;
	var detailDisabled = document.getElementById("detailDisabled").checked;
	var customDataEnabled = document.getElementById("customDataEnabled").checked;
	var colorsEnabled = document.getElementById("colorsEnabled").checked;
	var dropDowns = document.getElementsByClassName("dropDowns");
	var textSaveMode = document.getElementById("textSaveMode").value;
	var dropDownsValues = [];
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
		"triggerDelay" : triggerDelay,
		"dropDownArraysConfig" : JSON.stringify(dropDownsValues),
		"dropDownMappings" : JSON.stringify(colorMappings),
		"enabledBoxesConfig" : JSON.stringify(enabledBoxes),
		"notesConfig" : notesEnabled,
		"cleanupConfig" : cleanupEnabled,
		"detailConfig" : detailDisabled,
		"customDataConfig" : customDataEnabled,
		"colorsEnabled" : colorsEnabled,
		"stashConfig" : stashEnabled,
		"textSaveMode" : textSaveMode
	};
	localStorage.setItem(CONFIG_SAVE_DATA, JSON.stringify(saveData));
}


function saveAndReload() {
	save();
	location.reload();
}

function loadConfig() {
	var data = JSON.parse(localStorage.getItem(CONFIG_SAVE_DATA));
	var jiraLocation = data["jiraLocationConfig"];
	var textSaveMode = data["textSaveMode"];
	var triggerDelay = data["triggerDelay"];
	var notes = data["notesConfig"];
	var stash = data["stashConfig"];
	var cleanup = data["cleanupConfig"];
	var detail = data["detailConfig"];
	var colorsEnabled = data["colorsEnabled"];
	var customData = data["customDataConfig"];
	var dropDowns = JSON.parse(data["dropDownArraysConfig"]);
	var mappings = JSON.parse(data["dropDownMappings"]);
	var enabledBoxes = JSON.parse(data["enabledBoxesConfig"]);

	document.getElementById("jiraLocation").value = jiraLocation;
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
	if (customData === true) {
		document.getElementById("customDataEnabled").checked = true;
	}
	if (dropDowns != null) {
		for (var i = 0; i < dropDowns.length; ++i) {
			var newTextArea = addDropDown();
			var content = dropDowns[i].toString();
			var map = JSON.parse(mappings[i]);
			var splitContent = content.split(',');
			for (var j=0;j<splitContent.length; ++j){
				if (map.hasOwnProperty(splitContent[j])){
					
					splitContent[j] = splitContent[j] + "[" + map[splitContent[j]] + "]";
				}
			}
			content = splitContent.join('\n');
			newTextArea.value = content;
		}
	}
	if (enabledBoxes != null) {
		for (var i = 0; i < enabledBoxes.length; ++i) {
			document.getElementById("checkbox" + enabledBoxes[i]).checked = true;
			newTextArea.value = content;
		}
	}
}