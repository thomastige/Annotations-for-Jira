document.getElementById("addTextField").addEventListener("click", addDropDown);
document.getElementById("stashEnabled").addEventListener("click", save);
document.getElementById("notesEnabled").addEventListener("click", save);
document.getElementById("cleanupEnabled").addEventListener("click", save);
document.getElementById("detailDisabled").addEventListener("click", save);
document.getElementById("customDataEnabled").addEventListener("click", saveAndReload);
document.getElementById("jiraLocation").addEventListener("keyup", save);

/*
	INITIAL LOAD -- SET DEFAULT VALUES
*/
if(localStorage.getItem("initialized") != 'true'){
	localStorage.setItem("dropDownArraysConfig", JSON.stringify([["", "To do", "To Investigate", "To Test", "Waiting for answer", "Needs BA/discussion", "WIP", "Awaiting code review", "To Redo/fix", "Ready for check-in", "Checked in", "Done"]]));
	localStorage.setItem("notesConfig", true);
	localStorage.setItem("cleanupConfig", true);
	localStorage.setItem("stashConfig", true);
	
	localStorage.setItem("initialized", true);
}

var counter = 0;
loadConfig();
function addDropDown(){
	var div = document.createElement("div");
	
	var newText = document.createElement("textArea");
	newText.setAttribute("id", "dropDownField"+counter);
	newText.setAttribute("class", "dropDowns");
	newText.style.height = "100px";
	newText.addEventListener("keyup", save);
	linebreak = document.createElement("br");
	var includeInMetadata = document.createTextNode("Include in note downloads? ");
	var checkbox = document.createElement("input")
	checkbox.type="checkbox";
	checkbox.id = "checkbox" + counter;
	checkbox.setAttribute("class", "dropDownMetadataCheckbox");
	checkbox.addEventListener("click", save);
	
	div.appendChild(newText);
	
	if (document.getElementById("customDataEnabled").checked){
		div.appendChild(linebreak);
		div.appendChild(includeInMetadata);
		div.appendChild(checkbox);
	}
	
	var container = document.getElementById("container");
	container.appendChild(div);
	counter+= 1;
	return newText;
}

function save(){
	var jiraLocation = document.getElementById("jiraLocation").value;
	var notesEnabled = document.getElementById("notesEnabled").checked;
	var stashEnabled = document.getElementById("stashEnabled").checked;
	var cleanupEnabled = document.getElementById("cleanupEnabled").checked;
	var detailDisabled = document.getElementById("detailDisabled").checked;
	var customDataEnabled = document.getElementById("customDataEnabled").checked;
	var dropDowns = document.getElementsByClassName("dropDowns");
	var dropDownsValues = [];
	for (var i=0; i<dropDowns.length; ++i){
		var textValue = dropDowns[i].value;
		if (textValue != ''){
			dropDownsValues.push(textValue.split("\n"));
		}
	}
	var checkboxes = document.getElementsByClassName("dropDownMetadataCheckbox");
	var enabledBoxes = [];
	for (var i=0; i<checkboxes.length; ++i){
		var checked = checkboxes[i].checked;
		if (checked){
			enabledBoxes.push(i);
		}
	}
	localStorage.setItem("jiraLocationConfig", jiraLocation);
	localStorage.setItem("dropDownArraysConfig", JSON.stringify(dropDownsValues));
	if(customDataEnabled != null){
		localStorage.setItem("enabledBoxesConfig", JSON.stringify(enabledBoxes));
	}
	localStorage.setItem("notesConfig", notesEnabled);
	localStorage.setItem("cleanupConfig", cleanupEnabled);
	localStorage.setItem("detailConfig", detailDisabled);
	localStorage.setItem("customDataConfig", customDataEnabled);
	localStorage.setItem("stashConfig", stashEnabled);
}

function saveAndReload(){
	save();
	location.reload();
}

function loadConfig(){
	var jiraLocation = localStorage.getItem("jiraLocationConfig");
	var notes = localStorage.getItem("notesConfig");
	var stash = localStorage.getItem("stashConfig");
	var cleanup = localStorage.getItem("cleanupConfig");
	var detail = localStorage.getItem("detailConfig");
	var customData = localStorage.getItem("customDataConfig");
	var dropDowns = JSON.parse(localStorage.getItem("dropDownArraysConfig"));
	var enabledBoxes = JSON.parse(localStorage.getItem("enabledBoxesConfig"));

	document.getElementById("jiraLocation").value = jiraLocation;
	if (notes == 'true'){
		document.getElementById("notesEnabled").checked = true;
	}
	if (stash == 'true'){
		document.getElementById("stashEnabled").checked = true;
	}
	if (cleanup == 'true'){
		document.getElementById("cleanupEnabled").checked = true;
	}
	if (detail == 'true'){
		document.getElementById("detailDisabled").checked = true;
	}
	if (customData == 'true'){
		document.getElementById("customDataEnabled").checked = true;
	}
	if (dropDowns != null){
		for (var i = 0; i<dropDowns.length; ++i){
			var newTextArea = addDropDown();
			var content = dropDowns[i].toString();
			content = content.split(',').join('\n');
			newTextArea.value = content;
		}
	}
	if (enabledBoxes != null){
		for (var i = 0; i<enabledBoxes.length; ++i){
			document.getElementById("checkbox" + enabledBoxes[i]).checked = true;
			newTextArea.value = content;
		}
	}
	
}