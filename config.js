document.getElementById("addTextField").addEventListener("click", addDropDown);
document.getElementById("stashEnabled").addEventListener("click", save);
document.getElementById("notesEnabled").addEventListener("click", save);
document.getElementById("cleanupEnabled").addEventListener("click", save);
document.getElementById("detailDisabled").addEventListener("click", save);
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

loadConfig();
function addDropDown(){
	var newText = document.createElement("textArea");
	var counter = 0;
	newText.setAttribute("id", "dropDownField"+counter++);
	newText.setAttribute("class", "dropDowns");
	newText.style.height = "100px";
	newText.addEventListener("keyup", save);
	linebreak = document.createElement("br");
	var container = document.getElementById("container");
	container.appendChild(newText);
	container.appendChild(linebreak);
	return newText;
}

function save(){
	var jiraLocation = document.getElementById("jiraLocation").value;
	var notesEnabled = document.getElementById("notesEnabled").checked;
	var stashEnabled = document.getElementById("stashEnabled").checked;
	var cleanupEnabled = document.getElementById("cleanupEnabled").checked;
	var detailDisabled = document.getElementById("detailDisabled").checked;
	var dropDowns = document.getElementsByClassName("dropDowns");
	var dropDownsValues = [];
	for (var i=0; i<dropDowns.length; ++i){
		var textValue = dropDowns[i].value;
		if (textValue != ''){
			dropDownsValues.push(textValue.split("\n"));
		}
	}
	localStorage.setItem("jiraLocationConfig", jiraLocation);
	localStorage.setItem("dropDownArraysConfig", JSON.stringify(dropDownsValues));
	localStorage.setItem("notesConfig", notesEnabled);
	localStorage.setItem("cleanupConfig", cleanupEnabled);
	localStorage.setItem("detailConfig", detailDisabled);
	localStorage.setItem("stashConfig", stashEnabled);
}

function loadConfig(){
	var jiraLocation = localStorage.getItem("jiraLocationConfig");
	var notes = localStorage.getItem("notesConfig");
	var stash = localStorage.getItem("stashConfig");
	var cleanup = localStorage.getItem("cleanupConfig");
	var detail = localStorage.getItem("detailConfig");
	var dropDowns = JSON.parse(localStorage.getItem("dropDownArraysConfig"));

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
	for (var i = 0; i<dropDowns.length; ++i){
		var newTextArea = addDropDown();
		var content = dropDowns[i].toString();
		content = content.split(',').join('\n');
		newTextArea.value = content;
	}
	
}