var counter = 0;

document.getElementById("addTextField").addEventListener("click", addDropDown);

loadConfig();
function addDropDown(){
	var newText = document.createElement("textArea");
	newText.setAttribute("id", "dropDownField"+counter++);
	newText.setAttribute("class", "dropDowns");
	newText.style.height = "100px";
	
	linebreak = document.createElement("br");
	var container = document.getElementById("container");
	container.appendChild(newText);
	container.appendChild(linebreak);
	return newText;
}

document.getElementById("saveButton").addEventListener("click", function() {
	var jiraLocation = document.getElementById("jiraLocation").value;
	var notesEnabled = document.getElementById("notesEnabled").checked;
	var stashEnabled = document.getElementById("stashEnabled").checked;
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
	localStorage.setItem("stashConfig", stashEnabled);
		
	//console.log(finalJSON);
	//alert('Data was saved.');
});

function loadConfig(){
	var jiraLocation = localStorage.getItem("jiraLocationConfig");
	var notes = localStorage.getItem("notesConfig");
	var stash = localStorage.getItem("stashConfig");
	var dropDowns = JSON.parse(localStorage.getItem("dropDownArraysConfig"));

	document.getElementById("jiraLocation").value = jiraLocation;
	if (notes == 'true'){
		document.getElementById("notesEnabled").checked = true;
	}
	if (stash == 'true'){
		document.getElementById("stashEnabled").checked = true;
	}
	for (var i = 0; i<dropDowns.length; ++i){
		var newTextArea = addDropDown();
		var content = dropDowns[i].toString();
		content = content.split(',').join('\n');
		newTextArea.value = content;
	}
	
}