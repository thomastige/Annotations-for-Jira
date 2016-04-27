var values = [
["", "To do", "To Investigate", "To Test", "Waiting for answer", "Needs BA/discussion", "WIP", "Awaiting code review", "To Redo/fix", "Ready for check-in", "Checked in", "Done"]
];
/*
To add a new dropdown, add a comma and an array, as follows:
,["element 1", "element 2", ...]
*/

function findElements(name){
	var elArray = [];
	var tmp = document.getElementById("ghx-content-group").getElementsByTagName("*");
	
	var regex = new RegExp("(^|\\s)" + name + "(\\s|$)");
	for (var i = 0; i<tmp.length;i++){
		if (tmp[i].className.indexOf(name) > -1){
			elArray.push(tmp[i]);
		}
	}
	return elArray;
}

function saveDropDowns(){
	var elements = findElements("ghx-issue-compact");
	for (var i=0;i<elements.length; i++){		
		var curr = elements[i];
		var rightEdge = curr.childNodes[0].childNodes[1];
		var currId = curr.getAttribute("data-issue-key");
		for (var iterator =0; iterator < rightEdge.childNodes.length; ++iterator){
			try {
				var id = rightEdge.childNodes[iterator].getAttribute("id");
				if (id != null){
						var currDropDown = (rightEdge.childNodes[iterator]);
						if (currDropDown != null){
							var value = currDropDown.value;
							localStorage.setItem(currId + currDropDown.getAttribute("id"), value);
						}
					}
			//Not a great solution, but need to figure it out
			//}catch(err){console.log(err)}
			}catch(err){}
		} 
	}
}

function createSelectNode(currId, finished = false, array){
	var select = document.createElement("select");
	select.setAttribute("id", "customSelect" + array);
	for (var j=0;j<values[array].length;j++){
		var option = document.createElement('option');				
		option.text = values[array][j];
		select.add(option, j);
	}
	if  (finished == true){
		select.value = 'Done';
		select.disabled = true;
	} else {
		select.value= localStorage.getItem(currId + select.getAttribute("id"));
	}
	select.addEventListener("click", saveDropDowns);
	return select;
}

function createInputNode(currId){
	var input = document.createElement("input");
	input.setAttribute("id", "customInput");
	var inputValue = localStorage.getItem(currId + input.getAttribute("id"));
	if (inputValue != 'undefined'){
		input.value = inputValue;
	}
	input.addEventListener("blur", saveDropDowns);
	return input;
}

function addDropDowns(){
	var location = window.location.href;
	if (location.indexOf("browse") != -1){
		var currId = document.getElementsByClassName("aui-nav aui-nav-breadcrumbs __skate")[0].childNodes[1].childNodes[0].getAttribute("data-issue-key");
		for (var counter=0;counter<values.length;counter++){
			document.getElementsByClassName("aui-nav aui-nav-breadcrumbs __skate")[0].appendChild(createSelectNode(currId, false, counter));
		}
		document.getElementsByClassName("aui-nav aui-nav-breadcrumbs __skate")[0].appendChild(createInputNode(currId));
	}
	else if (location.indexOf("RapidBoard.jspa") != -1){
		var elements = findElements("ghx-issue-compact");
		for (var i=0;i<elements.length; i++){		
			var curr = elements[i];
			
			var rightEdge = curr.childNodes[0].childNodes[1];
			currId = curr.getAttribute("data-issue-key");
			rightEdge.insertBefore(createInputNode(currId), rightEdge.childNodes[0]);
			for (var counter=0;counter<values.length;counter++){
				rightEdge.insertBefore(createSelectNode(currId, false, counter), rightEdge.childNodes[0]);
			}
		}
	}
}
/*TODO: find more elegant solution*/
setTimeout(addDropDowns, 750);

